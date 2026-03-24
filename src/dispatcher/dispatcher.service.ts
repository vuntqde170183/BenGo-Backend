import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssignDriverDto,
  DashboardStatsResponseDto,
  DriverMapResponseDto,
  DriverPerformanceResponseDto,
  MarkSpecialDto,
  OrderSummaryResponseDto,
  SpecialOrderResponseDto,
  SupportTicketResponseDto,
} from './dto/dispatcher.dto';
import { Order } from '../orders/orders.schema';
import { Driver } from '../driver/driver.schema';
import { SupportTicket } from './support-ticket.schema';
import { AssignmentHistory } from './assignment-history.schema';
import { NotificationService } from '../utils/notification.service';


@Injectable()
export class DispatcherService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
    @InjectModel(AssignmentHistory.name) private assignmentHistoryModel: Model<AssignmentHistory>,
    private readonly notificationService: NotificationService,
  ) { }


  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      pendingOrders,
      activeOrders,
      completedToday,
      onlineDrivers,
      openTickets,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'PENDING' }),
      this.orderModel.countDocuments({ status: { $in: ['ACCEPTED', 'PICKED_UP'] } }),
      this.orderModel.countDocuments({
        status: 'DELIVERED',
        updatedAt: { $gte: today },
      }),
      this.driverModel.countDocuments({ isOnline: true }),
      this.supportTicketModel.countDocuments({ status: 'OPEN' }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      completedToday,
      onlineDrivers,
      openTickets,
    };
  }

  async getOrders(status: string): Promise<any[]> {
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const orders = await this.orderModel
      .find(query)
      .populate('customerId', 'name phone email avatar')
      .populate('driverId', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    return orders;
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email avatar');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getAllDrivers(): Promise<any[]> {
    const drivers = await this.driverModel.find().populate('userId', 'name phone email avatar rating').exec();
    return drivers.map(driver => {
      const driverObj = driver.toObject();
      return {
        ...driverObj,
        id: driver._id.toString(),
        name: (driver.userId as any)?.name || 'Unknown',
        location: {
          lat: driver.location.coordinates[1],
          lng: driver.location.coordinates[0],
        },
        status: driver.isOnline ? 'ONLINE' : 'OFFLINE',
        phone: (driver.userId as any)?.phone,
      };
    });
  }

  async getSpecialOrders(): Promise<any[]> {
    const orders = await this.orderModel
      .find({ priority: { $in: ['VIP', 'URGENT', 'FRAGILE'] } })
      .populate('customerId', 'name phone email avatar')
      .populate('driverId', 'name phone email avatar')
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }

  async markSpecial(orderId: string, dto: MarkSpecialDto): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    (order as any).priority = dto.priority;
    (order as any).specialNote = dto.specialNote;
    (order as any).tags = dto.tags || [];

    await order.save();
  }

  async unmarkSpecial(orderId: string): Promise<void> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    (order as any).priority = 'NORMAL';
    (order as any).specialNote = null;
    (order as any).tags = [];

    await order.save();
  }

  async getDrivers(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<any[]> {
    // Find drivers within radius using geospatial query
    const drivers = await this.driverModel
      .find({
        isOnline: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [Number(lng), Number(lat)],
            },
            $maxDistance: Number(radius) * 1000, // Convert km to meters
          },
        },
      })
      .populate('userId', 'name phone email avatar rating')
      .exec();

    return drivers.map(driver => {
      const driverObj = driver.toObject();
      return {
        ...driverObj,
        id: driver._id.toString(),
        name: (driver.userId as any)?.name || 'Unknown',
        location: {
          lat: driver.location.coordinates[1],
          lng: driver.location.coordinates[0],
        },
        status: driver.isOnline ? 'ONLINE' : 'OFFLINE',
      };
    });
  }

  async getDriverPerformance(
    driverId: string,
    from: string,
    to: string,
  ): Promise<DriverPerformanceResponseDto> {
    const driver = await this.driverModel.findById(driverId).populate('userId', 'name');
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const startDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = to ? new Date(to) : new Date();

    const orders = await this.orderModel.find({
      driverId: driver.userId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const completedTrips = orders.filter(o => o.status === 'DELIVERED');
    const cancelledTrips = orders.filter(o => o.status === 'CANCELLED');
    const totalEarnings = completedTrips.reduce((sum, o) => sum + o.totalPrice, 0);

    return {
      driverId,
      name: (driver.userId as any)?.name || 'Unknown',
      totalTrips: orders.length,
      completedTrips: completedTrips.length,
      cancelledTrips: cancelledTrips.length,
      rating: (driver as any).rating || 5.0,
      totalEarnings,
      acceptanceRate: orders.length > 0 ? (completedTrips.length / orders.length) * 100 : 0,
      chartData: [], // Thực tế sẽ group orders theo ngày ở đây
    };
  }

  async assignDriver(dto: AssignDriverDto & { dispatcherId: string }): Promise<void> {

    const order = await this.orderModel.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const driver = await this.driverModel.findById(dto.driverId).populate('userId', 'name');

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isOnline) {
      throw new Error('Driver is not online');
    }

    if (driver.status !== 'APPROVED') {
      throw new Error('Driver is not approved');
    }

    order.driverId = driver.userId as any;
    order.status = 'ACCEPTED';
    await order.save();

    await this.notificationService.createNotification(
      order.customerId,
      'Tài xế đã nhận đơn',
      `Tài xế ${(driver.userId as any)?.name || 'BenGo'} đang trên đường đến điểm lấy hàng.`,
      'ORDER_STATUS',
      { orderId: order._id.toString(), status: 'ACCEPTED' }
    );

    // Save assignment history
    await this.assignmentHistoryModel.create({
      orderId: dto.orderId,
      driverId: dto.driverId,
      dispatcherId: dto.dispatcherId,
      status: 'SUCCESS',
    });
  }

  async getAssignmentHistory(page: number = 1, limit: number = 10): Promise<any> {
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
      this.assignmentHistoryModel
        .find()
        .populate('orderId')
        .populate({
          path: 'driverId',
          populate: {
            path: 'userId',
            select: 'name phone email avatar rating',
          },
        })
        .populate({
          path: 'dispatcherId',
          select: 'name phone email avatar',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.assignmentHistoryModel.countDocuments(),
    ]);

    return {
      data: history,
      total,
      page,
      limit,
    };
  }

  async getSupportTickets(status: string): Promise<any[]> {
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const tickets = await this.supportTicketModel
      .find(query)
      .populate('userId', 'name phone email avatar role')
      .populate('orderId')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return tickets;
  }

  async updateTicket(ticketId: string, updateData: any): Promise<void> {
    const ticket = await this.supportTicketModel.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (updateData.status) {
      ticket.status = updateData.status;
    }

    if (updateData.note) {
      ticket.adminNote = updateData.note;
    }

    if (updateData.resolution) {
      ticket.resolution = updateData.resolution;
    }

    await ticket.save();
  }
}
