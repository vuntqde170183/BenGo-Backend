import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApproveDriverDto,
  ReportsResponseDto,
  UpdatePricingDto,
  UserListResponseDto,
} from './dto/admin.dto';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { User } from '../user/user.schema';
import { Driver } from '../driver/driver.schema';
import { Order } from '../orders/orders.schema';
import { PricingConfig } from './pricing-config.schema';
import { Promotion } from './promotion.schema';
import { SupportTicket } from '../dispatcher/support-ticket.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(PricingConfig.name) private pricingConfigModel: Model<PricingConfig>,
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
  ) {}

  // ============= USER MANAGEMENT =============
  async getUsers(role: string, search: string, page: number = 1, limit: number = 20): Promise<UserListResponseDto> {
    const query: any = {};
    
    if (role && role !== 'ALL') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel.find(query).select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query),
    ]);
    
    return {
      data: users.map(user => ({
        id: user._id.toString(),
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        walletBalance: user.walletBalance,
      })),
      meta: { total, page, limit },
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async blockUser(id: string, blocked: boolean, reason?: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.save();
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  // ============= DRIVER MANAGEMENT =============
  async getAllDrivers(status?: string): Promise<any> {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const drivers = await this.driverModel.find(query).populate('userId', 'name phone email rating').exec();
    return { data: drivers, total: drivers.length };
  }

  async approveDriver(dto: ApproveDriverDto): Promise<void> {
    const driver = await this.driverModel.findById(dto.driverId);
    
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (dto.action === 'APPROVE') {
      driver.status = 'APPROVED';
    } else if (dto.action === 'REJECT') {
      driver.status = 'LOCKED';
    }

    await driver.save();
  }

  // ============= ORDER MANAGEMENT =============
  async getAllOrders(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('customerId', 'name phone')
        .populate('driverId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return { data: orders, meta: { total, page, limit } };
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone')
      .exec();
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async forceCancelOrder(id: string, reason: string): Promise<void> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = 'CANCELLED';
    await order.save();
  }

  // ============= PRICING CONFIGURATION =============
  async getPricing(): Promise<any> {
    const configs = await this.pricingConfigModel.find().exec();
    return configs;
  }

  async updatePricing(dto: UpdatePricingDto): Promise<void> {
    const vehicleTypes = ['BIKE', 'VAN', 'TRUCK'];
    
    for (const vehicleType of vehicleTypes) {
      await this.pricingConfigModel.findOneAndUpdate(
        { vehicleType },
        {
          basePrice: dto.basePrice,
          perKm: dto.perKm,
          peakHourMultiplier: dto.peakHourMultiplier,
          vehicleType,
        },
        { upsert: true, new: true }
      );
    }
  }

  // ============= PROMOTION MANAGEMENT =============
  async getAllPromotions(active?: boolean): Promise<any> {
    const query: any = {};
    if (active !== undefined) {
      query.isActive = active;
    }

    const promotions = await this.promotionModel.find(query).sort({ createdAt: -1 }).exec();
    return { data: promotions, total: promotions.length };
  }

  async createPromotion(dto: CreatePromotionDto): Promise<any> {
    const promotion = new this.promotionModel(dto);
    return await promotion.save();
  }

  async updatePromotion(id: string, dto: UpdatePromotionDto): Promise<void> {
    const result = await this.promotionModel.findByIdAndUpdate(id, dto, { new: true });
    if (!result) {
      throw new NotFoundException('Promotion not found');
    }
  }

  async deletePromotion(id: string): Promise<void> {
    const result = await this.promotionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Promotion not found');
    }
  }

  // ============= SUPPORT TICKETS / COMPLAINTS =============
  async getAllTickets(status?: string, priority?: string): Promise<any> {
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await this.supportTicketModel
      .find(query)
      .populate('userId', 'name phone email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .exec();

    return { data: tickets, total: tickets.length };
  }

  async getTicketById(id: string): Promise<any> {
    const ticket = await this.supportTicketModel
      .findById(id)
      .populate('userId', 'name phone email')
      .populate('assignedTo', 'name email')
      .populate('orderId')
      .exec();
    
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async assignTicket(id: string, assignedTo: string): Promise<void> {
    const ticket = await this.supportTicketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    ticket.assignedTo = assignedTo;
    ticket.status = 'IN_PROGRESS';
    await ticket.save();
  }

  async updateTicketStatus(id: string, status: string, resolution?: string): Promise<void> {
    const ticket = await this.supportTicketModel.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    ticket.status = status;
    await ticket.save();
  }

  // ============= REPORTS & STATISTICS =============
  async getReports(type: string): Promise<ReportsResponseDto> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let dailyRevenue = 0;
    let monthlyRevenue = 0;

    if (type === 'REVENUE' || type === 'ALL') {
      const dailyOrders = await this.orderModel.find({
        createdAt: { $gte: startOfDay },
        paymentStatus: 'PAID',
      });
      
      const monthlyOrders = await this.orderModel.find({
        createdAt: { $gte: startOfMonth },
        paymentStatus: 'PAID',
      });

      dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    }

    return {
      revenue: {
        daily: dailyRevenue,
        monthly: monthlyRevenue,
      },
    };
  }

  async getDashboard(): Promise<any> {
    const [
      totalUsers,
      totalDrivers,
      totalOrders,
      activeOrders,
      totalRevenue,
      pendingTickets,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'CUSTOMER' }),
      this.userModel.countDocuments({ role: 'DRIVER' }),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: { $in: ['PENDING', 'ACCEPTED', 'PICKED_UP'] } }),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.supportTicketModel.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    ]);

    return {
      users: totalUsers,
      drivers: totalDrivers,
      orders: totalOrders,
      activeOrders,
      revenue: totalRevenue[0]?.total || 0,
      pendingTickets,
    };
  }
}
