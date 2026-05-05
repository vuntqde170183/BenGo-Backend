import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DriverOrderHistoryResponseDto,
  PendingOrderResponseDto,
  StatsResponseDto,
  ToggleStatusDto,
  UpdateLocationDto,
  UpdateTripStatusDto,
  UploadDocumentDto,
  DriverDocumentsResponseDto,
  SubmitVerificationDto,
} from './dto/driver.dto';
import { Driver } from './driver.schema';
import { Order } from '../orders/orders.schema';
import { User } from '../user/user.schema';
import { NotificationService } from '../utils/notification.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly notificationService: NotificationService,
    private readonly mailService: MailService,
  ) { }

  async toggleStatus(driverId: string, dto: ToggleStatusDto): Promise<void> {
    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy hồ sơ tài xế');
    }

    driver.isOnline = dto.isOnline;
    driver.location = {
      type: 'Point',
      coordinates: [dto.location.lng, dto.location.lat],
    };

    await driver.save();
  }

  async getPendingOrders(
    driverId: string,
    lat: number,
    lng: number,
    radius: number,
  ): Promise<PendingOrderResponseDto[]> {
    const driver = await this.driverModel.findOne({ userId: driverId });
    if (!driver) {
      throw new NotFoundException('Không tìm thấy hồ sơ tài xế');
    }

    // Find pending orders with matching vehicleType within radius
    const orders = await this.orderModel
      .find({
        status: 'PENDING',
        vehicleType: driver.vehicleType,
        'pickup.lat': {
          $gte: lat - radius / 111, // Rough conversion: 1 degree ≈ 111km
          $lte: lat + radius / 111,
        },
        'pickup.lng': {
          $gte: lng - radius / 111,
          $lte: lng + radius / 111,
        },
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    return orders.map((order) => {
      // Calculate approximate distance (Haversine formula would be more accurate)
      const latDiff = order.pickup.lat - lat;
      const lngDiff = order.pickup.lng - lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;

      return {
        orderId: order._id.toString(),
        distance: parseFloat(distance.toFixed(2)),
        price: order.totalPrice,
        pickupAddress: order.pickup.address,
        dropoffAddress: order.dropoff.address,
        vehicleType: order.vehicleType,
        createdAt: (order as any).createdAt,
      };
    });
  }

  async acceptOrder(driverId: string, orderId: string): Promise<any> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Đơn hàng không khả dụng');
    }

    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy hồ sơ tài xế');
    }

    if (!driver.isOnline) {
      throw new Error('Tài xế phải trực tuyến để nhận đơn hàng');
    }

    if (driver.vehicleType !== order.vehicleType) {
      throw new Error(`Phương tiện của bạn (${driver.vehicleType}) không phù hợp với yêu cầu đơn hàng (${order.vehicleType})`);
    }

    order.driverId = driverId;
    order.status = 'ACCEPTED';
    await order.save();

    const userDriver = await this.userModel.findById(driverId);
    await this.notificationService.createNotification(
      order.customerId,
      'Tài xế đã nhận đơn',
      `Tài xế ${userDriver?.name || 'BenGo'} đang trên đường đến điểm lấy hàng.`,
      'ORDER_STATUS',
      { orderId: order._id.toString(), status: 'ACCEPTED' }
    );

    return {
      success: true,
      order: {
        id: order._id.toString(),
        status: order.status,
        pickup: order.pickup,
        dropoff: order.dropoff,
        totalPrice: order.totalPrice,
      },
    };
  }

  async updateTripStatus(
    orderId: string,
    dto: UpdateTripStatusDto,
  ): Promise<void> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    // Validate status transition
    if (dto.status === 'PICKED_UP' && order.status !== 'ACCEPTED') {
      throw new Error('Đơn hàng phải được chấp nhận trước khi lấy hàng');
    }

    if (dto.status === 'DELIVERED' && order.status !== 'PICKED_UP') {
      throw new Error('Đơn hàng phải được lấy trước khi giao hàng');
    }

    order.status = dto.status;

    if (dto.status === 'DELIVERED') {
      order.paymentStatus = 'PAID';

      const adminCommission = order.totalPrice * 0.2;
      const driverEarnings = order.totalPrice * 0.8;

      if (order.paymentMethod === 'WALLET') {
        const customer = await this.userModel.findById(order.customerId);
        if (customer) {
          customer.walletBalance -= order.totalPrice;
          await customer.save();
        }
        const userDriver = await this.userModel.findById(order.driverId);
        if (userDriver) {
          userDriver.walletBalance += driverEarnings;
          await userDriver.save();
        }
      } else if (order.paymentMethod === 'CASH') {
        const userDriver = await this.userModel.findById(order.driverId);
        if (userDriver) {
          userDriver.walletBalance -= adminCommission;
          await userDriver.save();
        }
      }

      await this.notificationService.createNotification(
        order.customerId,
        'Giao hàng thành công',
        `Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ!`,
        'ORDER_STATUS',
        { orderId: order._id.toString(), status: 'DELIVERED' }
      );

      // Gửi Biên lai điện tử qua email
      try {
        const customer = await this.userModel.findById(order.customerId);
        if (customer && customer.email) {
          this.mailService.sendReceipt(customer.email, customer.name, {
            id: order._id.toString(),
            pickup: order.pickup.address,
            dropoff: order.dropoff.address,
            price: order.totalPrice,
            vehicleType: order.vehicleType,
          }).catch(err => console.error('Lỗi gửi email biên lai:', err));
        }
      } catch (err) {
        console.error('Lỗi lấy thông tin khách hàng để gửi biên lai:', err);
      }
    } else if (dto.status === 'PICKED_UP') {
      await this.notificationService.createNotification(
        order.customerId,
        'Tài xế đã lấy hàng',
        `Tài xế đã lấy hàng và đang trên đường giao đến bạn.`,
        'ORDER_STATUS',
        { orderId: order._id.toString(), status: 'PICKED_UP' }
      );
    }

    await order.save();
  }

  async updateLocation(driverId: string, dto: UpdateLocationDto): Promise<void> {
    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Không tìm thấy hồ sơ tài xế');
    }

    driver.location = {
      type: 'Point',
      coordinates: [dto.lng, dto.lat],
    };

    await driver.save();
  }

  async uploadDocument(driverId: string, dto: UploadDocumentDto): Promise<void> {
    let driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      driver = new this.driverModel({
        userId: driverId,
        status: 'PENDING',
      });
    }

    switch (dto.type) {
      case 'IDENTITY_FRONT':
        driver.identityFrontImage = dto.imageUrl;
        if (dto.identityNumber) driver.identityNumber = dto.identityNumber;
        break;
      case 'IDENTITY_BACK':
        driver.identityBackImage = dto.imageUrl;
        if (dto.identityNumber) driver.identityNumber = dto.identityNumber;
        break;
      case 'DRIVING_LICENSE':
      case 'LICENSE':
        driver.licenseImage = dto.imageUrl;
        if (dto.drivingLicenseNumber)
          driver.drivingLicenseNumber = dto.drivingLicenseNumber;
        break;
      case 'VEHICLE_REGISTRATION':
      case 'VEHICLE':
        driver.vehicleRegistrationImage = dto.imageUrl;
        if (dto.plateNumber) driver.plateNumber = dto.plateNumber;
        if (dto.vehicleType) driver.vehicleType = dto.vehicleType;
        break;
      default:
        throw new Error('Loại tài liệu không hợp lệ');
    }

    await driver.save();
  }

  async getDocuments(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password');

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const driver = await this.driverModel.findOne({ userId: userId });

    const userObj: any = user.toObject();
    if (driver) {
      userObj.driverProfile = driver.toObject();
    }

    return userObj;
  }

  async getStats(driverId: string, from: string, to: string): Promise<StatsResponseDto> {
    const startDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = to ? new Date(to) : new Date();

    const orders = await this.orderModel.find({
      driverId,
      status: 'DELIVERED',
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalTrips = orders.length;

    // Get driver rating from driver profile
    const driver = await this.driverModel.findOne({ userId: driverId });
    const rating = driver?.rating || 5;

    return {
      totalEarnings,
      totalTrips,
      rating,
    };
  }

  async getOrders(
    driverId: string,
    page: number,
    limit: number,
    status?: string,
    search?: string,
    time?: string,
  ): Promise<any> {
    const query: any = { driverId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'pickup.address': { $regex: search, $options: 'i' } },
        { 'dropoff.address': { $regex: search, $options: 'i' } },
      ];
    }

    if (time) {
      const now = new Date();
      if (time === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.createdAt = { $gte: startOfToday };
      } else if (time === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: sevenDaysAgo };
      }
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate('customerId', 'name phone avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data: orders.map(order => ({
        id: order._id.toString(),
        status: order.status,
        pickup: order.pickup,
        dropoff: order.dropoff,
        vehicleType: order.vehicleType,
        totalPrice: order.totalPrice,
        distanceKm: order.distanceKm,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        goodsImages: order.goodsImages,
        createdAt: (order as any).createdAt,
        customer: order.customerId ? {
          name: (order.customerId as any).name || 'Khách hàng',
          phone: (order.customerId as any).phone || 'N/A',
          avatar: (order.customerId as any).avatar,
        } : null,
      })),
      pagination: {
        total,
        count: orders.length,
        per_page: limit,
        current_page: page,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async submitVerification(userId: string, dto: SubmitVerificationDto): Promise<any> {
    let driver = await this.driverModel.findOne({ userId });

    if (!driver) {
      driver = new this.driverModel({
        userId,
      });
    }

    // Map all fields from DTO to driver model
    driver.identityNumber = dto.identityNumber;
    if (dto.identityFrontImage) driver.identityFrontImage = dto.identityFrontImage;
    if (dto.identityBackImage) driver.identityBackImage = dto.identityBackImage;
    if (dto.licenseImage) driver.licenseImage = dto.licenseImage;
    driver.drivingLicenseNumber = dto.drivingLicenseNumber;
    driver.plateNumber = dto.plateNumber;
    driver.vehicleType = dto.vehicleType;
    if (dto.vehicleRegistrationImage) driver.vehicleRegistrationImage = dto.vehicleRegistrationImage;
    if (dto.bankInfo) driver.bankInfo = dto.bankInfo;

    // Reset status to PENDING for re-verification if it was rejected
    driver.status = 'PENDING';
    driver.rejectionReason = null;

    await driver.save();

    return {
      success: true,
      message: 'Hồ sơ đã được gửi để xác thực',
      status: driver.status,
    };
  }

  async getVerificationStatus(userId: string): Promise<any> {
    const driver = await this.driverModel.findOne({ userId });

    if (!driver) {
      return {
        status: 'NONE', // Never submitted
        message: 'Chưa có thông tin hồ sơ tài xế',
      };
    }

    return {
      status: driver.status,
      rejectionReason: driver.rejectionReason,
      updatedAt: (driver as any).updatedAt,
    };
  }
}
