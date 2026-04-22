import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UpdateDriverStatusDto,
  ReportsResponseDto,
  UpdatePricingDto,
  UserListResponseDto,
  CreateUserDto,
  UpdateOrderStatusDto,
} from './dto/admin.dto';
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { User } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';
import { Driver } from '../driver/driver.schema';
import { Order } from '../orders/orders.schema';
import { PricingConfig } from './pricing-config.schema';
import { Promotion } from './promotion.schema';
import { SupportTicket } from '../dispatcher/support-ticket.schema';
import { SpecialOrderResponseDto } from '../dispatcher/dto/dispatcher.dto';
import { MailService } from '../mail/mail.service';
import { createApiResponse, createPaginatedResponse } from '../utils/response.util';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(PricingConfig.name) private pricingConfigModel: Model<PricingConfig>,
    @InjectModel(Promotion.name) private promotionModel: Model<Promotion>,
    @InjectModel(SupportTicket.name) private supportTicketModel: Model<SupportTicket>,
    private readonly mailService: MailService,
  ) { }

  // ============= USER MANAGEMENT =============
  async getUsers(role: string, search: string, page: number = 1, limit: number = 20): Promise<any> {
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
      this.userModel.find(query).sort({ createdAt: -1 }).select('-password').skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query),
    ]);

    return createPaginatedResponse(users, total, page, limit, 'Lấy danh sách người dùng thành công');
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userObj: any = user.toObject();

    // Nếu là DRIVER, lấy thêm thông tin từ bảng Driver
    if (user.role === 'DRIVER') {
      const driver = await this.driverModel.findOne({ userId: id });
      if (driver) {
        userObj.driverProfile = driver.toObject();
      }
    }

    return createApiResponse(userObj, 'User retrieved successfully');
  }

  async blockUser(id: string, blocked: boolean, reason?: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.active = !blocked;
    if (reason) {
      user.blockedReason = reason;
    }
    await user.save();
  }

  async createUser(dto: CreateUserDto): Promise<any> {
    const { driverProfile, ...userDetails } = dto;

    // 1. Kiểm tra thông tin DRIVER trước khi tạo User
    if (dto.role === 'DRIVER') {
      const vehicleType = driverProfile?.vehicleType || dto.vehicleType;
      const plateNumber = driverProfile?.plateNumber || dto.plateNumber;

      if (!vehicleType || !plateNumber) {
        throw new BadRequestException('Tài xế cần có thông tin loại xe (vehicleType) và biển số xe (plateNumber)');
      }
    }

    const existingUser = await this.userModel.findOne({
      $or: [
        { phone: dto.phone },
        { email: dto.email }
      ].filter(cond => cond.email || cond.phone)
    });

    if (existingUser) {
      throw new BadRequestException('Email hoặc số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = new this.userModel({
      ...userDetails,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // 2. Nếu là DRIVER thì tạo thêm hồ sơ Driver
    if (dto.role === 'DRIVER') {
      const driverData: any = {
        userId: savedUser._id,
        vehicleType: driverProfile?.vehicleType || dto.vehicleType,
        plateNumber: driverProfile?.plateNumber || dto.plateNumber,
        status: 'APPROVED',
        isOnline: false,
      };

      // Thêm các trường tùy chọn nếu có
      const rating = driverProfile?.rating !== undefined ? driverProfile.rating : dto.rating;
      if (rating !== undefined) driverData.rating = rating;

      driverData.licenseImage = driverProfile?.licenseImage || dto.licenseImage;
      driverData.identityNumber = driverProfile?.identityNumber || dto.identityNumber;
      driverData.identityFrontImage = driverProfile?.identityFrontImage || dto.identityFrontImage;
      driverData.identityBackImage = driverProfile?.identityBackImage || dto.identityBackImage;
      driverData.vehicleRegistrationImage = driverProfile?.vehicleRegistrationImage || dto.vehicleRegistrationImage;
      driverData.drivingLicenseNumber = driverProfile?.drivingLicenseNumber || dto.drivingLicenseNumber;
      driverData.bankInfo = driverProfile?.bankInfo || dto.bankInfo;

      // Xóa các trường undefined để không lưu vào mongo
      Object.keys(driverData).forEach(key => driverData[key] === undefined && delete driverData[key]);

      const newDriver = new this.driverModel(driverData);
      await newDriver.save();
    }


    const result = savedUser.toObject();
    delete result.password;
    return result;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Nếu là DRIVER, xóa hồ sơ driver tương ứng
    if (user.role === 'DRIVER') {
      await this.driverModel.findOneAndDelete({ userId: id });
    }

    await this.userModel.findByIdAndDelete(id);
  }

  async updateUserRole(userId: string, role: string, driverProfile?: any, reason?: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const oldRole = user.role;

    // Nếu chuyển sang DRIVER, cần có thông tin driver profile
    if (role === 'DRIVER' && oldRole !== 'DRIVER') {
      if (!driverProfile || !driverProfile.vehicleType || !driverProfile.plateNumber) {
        throw new BadRequestException('Cần cung cấp thông tin vehicleType và plateNumber khi chuyển sang vai trò DRIVER');
      }

      // Tạo hồ sơ driver mới
      const newDriver = new this.driverModel({
        userId: user._id,
        vehicleType: driverProfile.vehicleType,
        plateNumber: driverProfile.plateNumber,
        status: 'APPROVED',
        isOnline: false,
        rating: driverProfile.rating || 5,
        licenseImage: driverProfile.licenseImage,
        identityNumber: driverProfile.identityNumber,
        identityFrontImage: driverProfile.identityFrontImage,
        identityBackImage: driverProfile.identityBackImage,
        vehicleRegistrationImage: driverProfile.vehicleRegistrationImage,
        drivingLicenseNumber: driverProfile.drivingLicenseNumber,
        bankInfo: driverProfile.bankInfo,
      });
      await newDriver.save();
    }

    // Nếu chuyển từ DRIVER sang role khác, xóa hồ sơ driver
    if (oldRole === 'DRIVER' && role !== 'DRIVER') {
      await this.driverModel.findOneAndDelete({ userId: user._id });
    }

    // Cập nhật role
    user.role = role;
    await user.save();

    return createApiResponse(
      {
        userId: user._id,
        name: user.name,
        oldRole,
        newRole: role,
        reason
      },
      'Cập nhật vai trò người dùng thành công'
    );
  }

  async updateUser(userId: string, updateData: any): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra phone và email đã tồn tại chưa (nếu có thay đổi)
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingPhone = await this.userModel.findOne({ phone: updateData.phone });
      if (existingPhone) {
        throw new BadRequestException('Số điện thoại đã được sử dụng');
      }
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.userModel.findOne({ email: updateData.email });
      if (existingEmail) {
        throw new BadRequestException('Email đã được sử dụng');
      }
    }

    // Cập nhật thông tin
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    await user.save();

    const result = user.toObject();
    delete result.password;

    return createApiResponse(result, 'Cập nhật thông tin người dùng thành công');
  }

  // ============= DRIVER MANAGEMENT =============
  async getAllDrivers(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const [drivers, total] = await Promise.all([
      this.driverModel.find(query).sort({ createdAt: -1 }).populate('userId', 'name phone email rating').skip(skip).limit(limit).exec(),
      this.driverModel.countDocuments(query),
    ]);

    return createPaginatedResponse(drivers, total, page, limit, 'Lấy danh sách tài xế thành công');
  }

  async updateDriverStatus(dto: UpdateDriverStatusDto): Promise<void> {
    const driver = await this.driverModel.findById(dto.driverId);

    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài xế');
    }

    // Validate: Bắt buộc phải có lý do khi REJECT hoặc LOCK
    if ((dto.status === 'REJECTED' || dto.status === 'LOCKED') && !dto.reason) {
      throw new BadRequestException(
        `Bắt buộc phải cung cấp lý do khi ${dto.status === 'REJECTED' ? 'từ chối' : 'khóa'} tài xế`
      );
    }

    // Cập nhật trạng thái
    if (dto.status === 'APPROVED') {
      if (!driver.vehicleType || !driver.plateNumber) {
        throw new BadRequestException('Tài xế cần có thông tin loại xe và biển số xe trước khi được duyệt');
      }
    }
    driver.status = dto.status;

    // Tự động cập nhật Role User nếu trạng thái là APPROVED hoặc REJECTED/LOCKED
    if (driver.userId) {
      const user = await this.userModel.findById(driver.userId);
      if (user) {
        if (dto.status === 'APPROVED') {
          user.role = 'DRIVER';
        } else if (dto.status === 'REJECTED') {
          user.role = 'CUSTOMER';
        }
        await user.save();
      }
    }

    if (dto.reason) {
      driver.rejectionReason = dto.reason;
    }
    if (dto.note) {
      driver.adminNote = dto.note;
    }

    if (dto.status === 'APPROVED' || dto.status === 'PENDING') {
      driver.rejectionReason = undefined;
      driver.adminNote = undefined;
    }

    await driver.save();

    if (dto.status === 'APPROVED' || dto.status === 'REJECTED') {
      try {
        const user = await this.userModel.findById(driver.userId);
        if (user && user.email) {
          this.mailService.sendDriverApproval(
            user.email,
            user.name,
            dto.status as any,
            dto.reason
          ).catch(err => console.error('Lỗi gửi email thông báo tài xế:', err));
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin tài xế để gửi email thông báo duyệt:', err);
      }
    }
  }

  async deleteDriver(id: string): Promise<void> {
    const driver = await this.driverModel.findById(id);
    if (!driver) {
      throw new NotFoundException('Không tìm thấy tài xế');
    }

    const userId = driver.userId;

    await this.driverModel.findByIdAndDelete(id);

    if (userId) {
      await this.userModel.findByIdAndDelete(userId);
    }
  }

  async getAllOrders(status?: string, search?: string, page: number = 1, limit: number = 20): Promise<any> {
    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        {
          $expr: {
            $regexMatch: {
              input: { $toString: '$_id' },
              regex: search,
              options: 'i',
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate('customerId', 'name phone email avatar')
        .populate('driverId', 'name phone email avatar')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return createPaginatedResponse(orders, total, page, limit, 'Orders retrieved successfully');
  }

  async getOrderById(id: string): Promise<any> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return createApiResponse(order, 'Order retrieved successfully');
  }

  async forceCancelOrder(id: string, reason: string): Promise<void> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = 'CANCELLED';
    await order.save();
  }

  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<void> {
    const order = await this.orderModel.findById(id);
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (dto.status) {
      order.status = dto.status;
    }

    if (dto.paymentStatus) {
      order.paymentStatus = dto.paymentStatus;
    }

    await order.save();
  }

  async getSpecialOrders(page: number = 1, limit: number = 20): Promise<any> {
    const query = { priority: { $in: ['VIP', 'URGENT', 'FRAGILE'] } };
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

    return createPaginatedResponse(
      orders,
      total,
      page,
      limit,
      'Lấy danh sách đơn hàng đặc biệt thành công',
    );
  }

  // ============= PRICING CONFIGURATION =============
  async getPricing(): Promise<any> {
    const configs = await this.pricingConfigModel.find().exec();
    return createApiResponse(configs, 'Pricing config retrieved successfully');
  }

  async updatePricing(dto: UpdatePricingDto, vehicleTypeParam?: string): Promise<void> {
    const vehicleTypes = vehicleTypeParam ? [vehicleTypeParam.toUpperCase()] : ['BIKE', 'VAN', 'TRUCK'];

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
  async getAllPromotions(
    status?: string,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    const query: any = {};
    const now = new Date();

    if (status === 'ACTIVE') {
      query.isActive = true;
      query.endDate = { $gt: now };
      query.$or = [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ];
    } else if (status === 'EXPIRED') {
      query.endDate = { $lte: now };
    } else if (status === 'USAGE_LIMIT') {
      query.usageLimit = { $ne: null };
      query.$expr = { $gte: ['$usedCount', '$usageLimit'] };
    } else if (status === 'INACTIVE') {
      query.$or = [
        { isActive: false },
        { endDate: { $lte: now } },
        {
          $and: [
            { usageLimit: { $ne: null } },
            { $expr: { $gte: ['$usedCount', '$usageLimit'] } },
          ],
        },
      ];
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { code: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
      ];

      if (query.$or) {
        const existingQuery = { ...query };
        delete query.$or;
        delete query.isActive;
        delete query.endDate;
        delete query.usageLimit;
        delete query.$expr;

        query.$and = [
          existingQuery,
          { $or: searchConditions }
        ];
      } else {
        query.$or = searchConditions;
      }
    }

    const skip = (page - 1) * limit;
    const [promotions, total] = await Promise.all([
      this.promotionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.promotionModel.countDocuments(query),
    ]);

    return createPaginatedResponse(
      promotions,
      total,
      page,
      limit,
      'Lấy danh sách khuyến mãi thành công',
    );
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

  async getAllTickets(status?: string, priority?: string, page: number = 1, limit: number = 20): Promise<any> {
    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;
    const [tickets, total] = await Promise.all([
      this.supportTicketModel
        .find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'name phone email')
        .populate('assignedTo', 'name email')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.supportTicketModel.countDocuments(query),
    ]);

    return createPaginatedResponse(tickets, total, page, limit, 'Lấy danh sách phiếu hỗ trợ thành công');
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
    return createApiResponse(ticket, 'Ticket retrieved successfully');
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
  async getReports(type: string, period: string = 'WEEK'): Promise<ReportsResponseDto> {
    const tz = '+07:00'; // Việt Nam Timezone
    const now = new Date();

    // 1. Tính toán mốc thời gian dựa trên period
    let startDate: Date;
    let format: string;
    let limit: number;
    let iterateUnit: 'day' | 'month';

    switch (period.toUpperCase()) {
      case 'YEAR':
        startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 11, 1, -7, 0, 0, 0));
        format = '%Y-%m';
        limit = 12;
        iterateUnit = 'month';
        break;
      case 'MONTH':
        startDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, -7, 0, 0, 0));
        format = '%Y-%m-%d';
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        limit = daysInMonth;
        iterateUnit = 'day';
        break;
      case 'WEEK':
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        format = '%Y-%m-%d';
        limit = 7;
        iterateUnit = 'day';
        break;
    }

    // Lấy thời điểm bắt đầu ngày, tháng hiện tại để làm card thống kê
    const startOfDay = new Date(now);
    startOfDay.setHours(startOfDay.getHours() + 7);
    startOfDay.setUTCHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 7);

    const currentStartOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, -7, 0, 0, 0));

    const revenueMatch = {
      $or: [{ paymentStatus: 'PAID' }, { status: 'DELIVERED' }],
    };

    const [
      dailyRevenueData,
      monthlyRevenueData,
      totalRevenueData,
      vehicleTypeRevenue,
      chartDataRaw,
      topDriversRaw,
      orderStatsRaw,
    ] = await Promise.all([
      // Doanh thu ngày (GMT+7)
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay },
            ...revenueMatch,
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      // Doanh thu tháng hiện tại (GMT+7)
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: currentStartOfMonth },
            ...revenueMatch,
          },
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      // Tổng doanh thu
      this.orderModel.aggregate([
        { $match: revenueMatch },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      // Doanh thu theo loại xe
      this.orderModel.aggregate([
        { $match: revenueMatch },
        { $group: { _id: '$vehicleType', total: { $sum: '$totalPrice' } } },
      ]),
      // Dữ liệu biểu đồ theo Period (GMT+7)
      this.orderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            ...revenueMatch,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: format, date: '$createdAt', timezone: tz } },
            total: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Top tài xế
      this.orderModel.aggregate([
        {
          $match: {
            ...revenueMatch,
            driverId: { $ne: null },
          },
        },
        {
          $group: {
            _id: '$driverId',
            revenue: { $sum: '$totalPrice' },
            completedOrders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      // Thống kê đơn hàng
      this.orderModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // Format vehicle type revenue
    const byVehicleType = { BIKE: 0, VAN: 0, TRUCK: 0 };
    vehicleTypeRevenue.forEach((item) => {
      if (byVehicleType.hasOwnProperty(item._id)) {
        byVehicleType[item._id] = item.total;
      }
    });

    // Format chart data based on period
    const chartData = [];
    if (iterateUnit === 'month') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - i, 1));
        const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
        const match = chartDataRaw.find((item) => item._id === monthStr);
        chartData.push({
          date: monthStr,
          value: match ? match.total : 0,
        });
      }
    } else {
      // iterate day
      for (let i = limit - 1; i >= 0; i--) {
        const d = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        if (period.toUpperCase() === 'MONTH') {
          // Lấy các ngày trong tháng hiện tại
          d.setDate(1);
          d.setDate(d.getDate() + (limit - 1 - i));
        } else {
          // Lấy 7 ngày gần nhất
          d.setDate(d.getDate() - i);
        }
        const dateStr = d.toISOString().split('T')[0];
        const match = chartDataRaw.find((item) => item._id === dateStr);
        chartData.push({
          date: dateStr,
          value: match ? match.total : 0,
        });
      }
    }

    // Populate top drivers info
    const topDrivers = await Promise.all(
      topDriversRaw.map(async (item) => {
        const driverDoc = await this.driverModel
          .findOne({ userId: item._id })
          .populate('userId');
        const user = driverDoc?.userId as any;
        return {
          driverId: item._id,
          name: user?.name || 'Unknown',
          revenue: item.revenue,
          completedOrders: item.completedOrders,
          rating: driverDoc?.rating || 0,
        };
      }),
    );

    // Format order stats
    const orderStats = {
      total: orderStatsRaw.reduce((sum, item) => sum + item.count, 0),
      completed: orderStatsRaw.find((item) => item._id === 'DELIVERED')?.count || 0,
      cancelled: orderStatsRaw.find((item) => item._id === 'CANCELLED')?.count || 0,
    };

    return {
      revenue: {
        daily: dailyRevenueData[0]?.total || 0,
        monthly: monthlyRevenueData[0]?.total || 0,
        total: totalRevenueData[0]?.total || 0,
        byVehicleType,
        chartData,
      },
      topDrivers,
      orderStats,
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
        { $match: { $or: [{ paymentStatus: 'PAID' }, { status: 'DELIVERED' }] } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      this.supportTicketModel.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
    ]);

    const dashboardData = {
      users: totalUsers,
      drivers: totalDrivers,
      orders: totalOrders,
      activeOrders,
      revenue: totalRevenue[0]?.total || 0,
      pendingTickets,
    };

    return createApiResponse(dashboardData, 'Dashboard data retrieved successfully');
  }
}
