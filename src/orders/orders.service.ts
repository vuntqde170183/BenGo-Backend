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

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
  ) { }

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
      totalPrice: estimate.price,
      distanceKm: estimate.distance,
      paymentMethod: 'CASH',
      paymentStatus: 'UNPAID',
    });

    await order.save();

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

    let driverRating = 5;
    if (order.driverId) {
      const driver = await this.driverModel.findOne({ userId: (order.driverId as any)._id });
      if (driver) driverRating = driver.rating;
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
        name: (order.driverId as any).name || 'Unknown',
        phone: (order.driverId as any).phone || 'N/A',
        avatar: (order.driverId as any).avatar,
        rating: driverRating,
      } : null,
      customer: order.customerId ? {
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

    if (order.customerId.toString() !== customerId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (!['PENDING', 'ACCEPTED'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = 'CANCELLED';
    await order.save();
  }

  async rateDriver(customerId: string, orderId: string, dto: RateDriverDto): Promise<void> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId.toString() !== customerId) {
      throw new BadRequestException('You can only rate your own orders');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('You can only rate completed orders');
    }

    if (!order.driverId) {
      throw new BadRequestException('No driver assigned to this order');
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
  ): Promise<OrderHistoryResponseDto> {
    const query: any = { customerId };

    if (status && status !== 'ALL') {
      query.status = status;
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

  async getNearbyDrivers(lat: number, lng: number, radius: number = 5): Promise<any[]> {
    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('Latitude và Longitude phải là số hợp lệ');
    }

    try {
      const drivers = await this.driverModel.find({
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
      }).limit(50).exec();

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
      console.error('Error in getNearbyDrivers:', error);
      // Nếu là lỗi index chưa tồn tại hoặc lỗi query, trả về mảng rỗng thay vì 500
      return [];
    }
  }
}

