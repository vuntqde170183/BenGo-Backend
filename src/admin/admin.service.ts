import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApproveDriverDto,
  ReportsResponseDto,
  UpdatePricingDto,
  UserListResponseDto,
} from './dto/admin.dto';
import { User } from '../user/user.schema';
import { Driver } from '../driver/driver.schema';
import { Order } from '../orders/orders.schema';
import { PricingConfig } from './pricing-config.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(PricingConfig.name) private pricingConfigModel: Model<PricingConfig>,
  ) {}

  async getUsers(role: string, search: string): Promise<UserListResponseDto> {
    const query: any = {};
    
    if (role && role !== 'ALL') {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await this.userModel.find(query).select('-password').exec();
    
    return {
      data: users.map(user => ({
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        rating: user.rating,
        walletBalance: user.walletBalance,
      })),
      meta: { total: users.length },
    };
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

  async updatePricing(dto: UpdatePricingDto): Promise<void> {
    // Update pricing for all vehicle types
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
}
