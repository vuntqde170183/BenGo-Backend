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

@Injectable()
export class DispatcherService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
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

  async getOrders(status: string): Promise<OrderSummaryResponseDto[]> {
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const orders = await this.orderModel
      .find(query)
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    return orders.map((order: any) => ({
      id: order._id.toString(),
      from: order.pickup.address || `${order.pickup.lat}, ${order.pickup.lng}`,
      to: order.dropoff.address || `${order.dropoff.lat}, ${order.dropoff.lng}`,
      status: order.status,
      customerName: order.customerId?.name || 'Unknown',
      customerPhone: order.customerId?.phone || 'N/A',
      createdAt: order.createdAt,
      priority: (order as any).priority,
    }));
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'userId vehicleType plateNumber');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getAllDrivers(): Promise<DriverMapResponseDto[]> {
    const drivers = await this.driverModel.find().populate('userId', 'name phone').exec();
    return drivers.map(driver => ({
      id: driver._id.toString(),
      name: (driver.userId as any)?.name || 'Unknown',
      location: {
        lat: driver.location.coordinates[1],
        lng: driver.location.coordinates[0],
      },
      status: driver.isOnline ? 'ONLINE' : 'OFFLINE',
      phone: (driver.userId as any)?.phone,
    }));
  }

  async getSpecialOrders(): Promise<SpecialOrderResponseDto[]> {
    const orders = await this.orderModel
      .find({ priority: { $ne: 'NORMAL' } })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 })
      .exec();

    return orders.map((order: any) => ({
      id: order._id.toString(),
      from: order.pickup.address || `${order.pickup.lat}, ${order.pickup.lng}`,
      to: order.dropoff.address || `${order.dropoff.lat}, ${order.dropoff.lng}`,
      status: order.status,
      priority: order.priority,
      specialNote: order.specialNote,
      tags: order.tags || [],
      customerName: order.customerId?.name || 'Unknown',
      customerPhone: order.customerId?.phone || 'N/A',
      createdAt: order.createdAt,
    }));
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
  ): Promise<DriverMapResponseDto[]> {
    // Find drivers within radius using geospatial query
    const drivers = await this.driverModel
      .find({
        isOnline: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        },
      })
      .populate('userId', 'name phone rating')
      .exec();

    return drivers.map(driver => ({
      id: driver._id.toString(),
      name: (driver.userId as any)?.name || 'Unknown',
      location: {
        lat: driver.location.coordinates[1],
        lng: driver.location.coordinates[0],
      },
      status: driver.isOnline ? 'ONLINE' : 'OFFLINE',
    }));
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
      driverId,
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

  async assignDriver(dto: AssignDriverDto): Promise<void> {
    const order = await this.orderModel.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const driver = await this.driverModel.findById(dto.driverId);

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.isOnline) {
      throw new Error('Driver is not online');
    }

    if (driver.status !== 'APPROVED') {
      throw new Error('Driver is not approved');
    }

    order.driverId = dto.driverId;
    order.status = 'ACCEPTED';
    await order.save();
  }

  async getSupportTickets(status: string): Promise<SupportTicketResponseDto[]> {
    const query: any = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const tickets = await this.supportTicketModel
      .find(query)
      .populate('userId', 'name phone')
      .populate('orderId', 'status')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return tickets.map((ticket: any) => ({
      id: ticket._id.toString(),
      user: ticket.userId?.name || 'Unknown User',
      phone: ticket.userId?.phone || 'N/A',
      content: ticket.content,
      status: ticket.status,
      createdAt: ticket.createdAt,
      orderId: ticket.orderId?.toString(),
    }));
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
