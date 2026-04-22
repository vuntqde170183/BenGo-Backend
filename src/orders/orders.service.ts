import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './orders.schema';
import { User } from '../user/user.schema';
import { Driver } from '../driver/driver.schema';
import {
  CancelOrderDto,
  CreateOrderDto,
  EstimatePriceDto,
  EstimateResponseDto,
  OrderHistoryResponseDto,
  OrderResponseDto,
  RateDriverDto,
} from './dto/orders.dto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_mock', {
      apiVersion: '2024-06-20' as any,
    });
  }

  async createPaymentIntent(dto: any): Promise<any> {
    const { amount, currency } = dto;
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount, // assume amount is in smallest unit (cents/vnđ)
        currency: currency || 'vnd',
        payment_method_types: ['card'],
      });

      return {
        client_secret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khởi tạo thanh toán Stripe: ' + error.message);
    }
  }

  async estimatePrice(dto: EstimatePriceDto): Promise<EstimateResponseDto> {
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const lat1 = dto.origin.lat * Math.PI / 180;
    const lat2 = dto.destination.lat * Math.PI / 180;
    const deltaLat = (dto.destination.lat - dto.origin.lat) * Math.PI / 180;
    const deltaLng = (dto.destination.lng - dto.origin.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Pricing logic based on vehicle type
    const basePrices = {
      BIKE: 15000,
      VAN: 50000,
      TRUCK: 80000,
    };

    const perKmPrices = {
      BIKE: 5000,
      VAN: 12000,
      TRUCK: 18000,
    };

    const basePrice = basePrices[dto.vehicleType] || basePrices.VAN;
    const perKm = perKmPrices[dto.vehicleType] || perKmPrices.VAN;

    const totalPrice = basePrice + (distance * perKm);

    // Estimate duration (assuming average speed of 30 km/h)
    const duration = Math.ceil((distance / 30) * 60); // in minutes

    return {
      distance: parseFloat(distance.toFixed(2)),
      duration,
      price: Math.round(totalPrice),
      currency: 'VND',
    };
  }

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    // Calculate price first
    const estimate = await this.estimatePrice({
      origin: dto.origin,
      destination: dto.destination,
      vehicleType: dto.vehicleType,
    });

    const order = new this.orderModel({
      customerId,
      pickup: {
        address: dto.origin.address,
        lat: dto.origin.lat,
        lng: dto.origin.lng,
      },
      dropoff: {
        address: dto.destination.address,
        lat: dto.destination.lat,
        lng: dto.destination.lng,
      },
      vehicleType: dto.vehicleType,
      goodsImages: dto.goodsImages,
      status: 'PENDING',
      totalPrice: dto.totalPrice || estimate.price,
      distanceKm: estimate.distance,
      paymentMethod: dto.paymentMethod || 'CASH',
      paymentStatus: dto.paymentMethod === 'STRIPE' ? 'PAID' : 'UNPAID',
    });

    await order.save();

    // Notify customer via email
    try {
      const user = await this.userModel.findById(customerId);
      if (user && user.email) {
        this.mailService.sendOrderConfirmation(user.email, user.name, {
          id: order._id.toString(),
          pickup: order.pickup.address,
          dropoff: order.dropoff.address,
          price: order.totalPrice,
          vehicleType: order.vehicleType,
        }).catch(err => console.error('Error sending order confirmation email:', err));
      }
    } catch (error) {
      console.error('Error fetching user for mail notification:', error);
    }

    // TODO: Notify nearby drivers about new order
    return {
      id: order._id.toString(),
      status: order.status,
    };
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('customerId', 'name phone email')
      .populate('driverId', 'name phone email avatar')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let driverProfile = null;
    if (order.driverId) {
      driverProfile = await this.driverModel.findOne({ userId: (order.driverId as any)._id });
    }

    return {
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
      driver: order.driverId ? {
        id: (order.driverId as any)._id.toString(),
        name: (order.driverId as any).name || 'Unknown',
        phone: (order.driverId as any).phone || 'N/A',
        avatar: (order.driverId as any).avatar,
        rating: driverProfile?.rating || 5,
        location: driverProfile?.location?.coordinates ? {
          lat: driverProfile.location.coordinates[1],
          lng: driverProfile.location.coordinates[0],
        } : null,
      } : null,
      customer: order.customerId ? {
        id: (order.customerId as any)._id.toString(),
        name: (order.customerId as any).name || 'Khách hàng',
        phone: (order.customerId as any).phone || 'N/A',
        email: (order.customerId as any).email,
      } : null,
      trackingPath: null,
    };
  }

  async cancelOrder(customerId: string, orderId: string, dto: CancelOrderDto): Promise<void> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId.toString() !== customerId.toString()) {
      throw new BadRequestException('Bạn chỉ có thể hủy đơn hàng của chính mình');
    }

    if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
      throw new BadRequestException('Đơn hàng không thể hủy ở giai đoạn này');
    }

    order.status = 'CANCELLED';
    await order.save();
  }

  async rateDriver(customerId: string, orderId: string, dto: RateDriverDto): Promise<void> {
    const order = await this.orderModel.findById(orderId).select('customerId status driverId');

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId?.toString() !== customerId.toString()) {
      throw new BadRequestException('Bạn chỉ có thể đánh giá đơn hàng của chính mình');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Bạn chỉ có thể đánh giá các đơn hành đã hoàn thành');
    }

    if (!order.driverId) {
      throw new BadRequestException('Chưa có tài xế nào được chỉ định cho đơn hàng này');
    }

    const driver = await this.driverModel.findOne({ userId: order.driverId });

    if (driver) {
      const currentRating = driver.rating || 5;
      const newRating = (currentRating + dto.star) / 2;
      driver.rating = parseFloat(newRating.toFixed(1));
      await driver.save();
    }
  }

  async getHistory(
    customerId: string,
    page: number,
    limit: number,
    status?: string,
    time?: string,
    search?: string,
  ): Promise<OrderHistoryResponseDto> {
    const query: any = { customerId };

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
        .populate('driverId', 'name phone avatar')
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
        driver: order.driverId ? {
          id: (order.driverId as any)._id.toString(),
          name: (order.driverId as any).name || 'Unknown',
          phone: (order.driverId as any).phone || 'N/A',
          avatar: (order.driverId as any).avatar,
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

  async getNearbyDrivers(lat: number, lng: number, radius: number = 5, vehicleType?: string): Promise<any[]> {
    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Latitude và Longitude phải là số hợp lệ');
    }

    const query: any = {
      isOnline: true,
      status: 'APPROVED',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat], // [longitude, latitude]
          },
          $maxDistance: radius * 1000,
        },
      },
    };

    if (vehicleType) {
      query.vehicleType = vehicleType;
    }

    try {
      const drivers = await this.driverModel.find(query).limit(50).exec();

      return drivers.map(d => ({
        id: d._id,
        vehicleType: d.vehicleType,
        location: {
          lat: d.location?.coordinates?.[1] || 0,
          lng: d.location?.coordinates?.[0] || 0,
        },
        rating: d.rating,
      }));
    } catch (error) {
      return [];
    }
  }

  async submitDeliveryProof(orderId: string, dto: { proofImage: string, notes?: string }): Promise<void> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status !== 'PICKED_UP') {
      throw new BadRequestException('Đơn hàng phải ở trạng thái Đã lấy hàng mới có thể xác thực giao hàng');
    }

    order.status = 'DELIVERED';
    order.deliveryProofImage = dto.proofImage;
    order.deliveryNotes = dto.notes;
    order.paymentStatus = 'PAID';

    await order.save();

    // Notify customer
    try {
      const customer = await this.userModel.findById(order.customerId);
      if (customer && customer.email) {
        this.mailService.sendReceipt(customer.email, customer.name, {
          id: order._id.toString(),
          pickup: order.pickup.address,
          dropoff: order.dropoff.address,
          price: order.totalPrice,
          vehicleType: order.vehicleType,
        }).catch(err => console.error('Error sending receipt email:', err));
      }
    } catch (error) {
      console.error('Error processing post-delivery logic:', error);
    }
  }
}

