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
} from './dto/driver.dto';
import { Driver } from './driver.schema';
import { Order } from '../orders/orders.schema';
import { User } from '../user/user.schema';

@Injectable()
export class DriverService {
  constructor(
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async toggleStatus(driverId: string, dto: ToggleStatusDto): Promise<void> {
    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    driver.isOnline = dto.isOnline;
    driver.location = {
      type: 'Point',
      coordinates: [dto.location.lng, dto.location.lat],
    };

    await driver.save();
  }

  async getPendingOrders(
    lat: number,
    lng: number,
    radius: number,
  ): Promise<PendingOrderResponseDto[]> {
    // Find pending orders within radius
    const orders = await this.orderModel
      .find({
        status: 'PENDING',
        'pickup.lat': {
          $gte: lat - radius / 111, // Rough conversion: 1 degree ≈ 111km
          $lte: lat + radius / 111,
        },
        'pickup.lng': {
          $gte: lng - radius / 111,
          $lte: lng + radius / 111,
        },
      })
      .limit(20)
      .exec();

    return orders.map(order => {
      // Calculate approximate distance (Haversine formula would be more accurate)
      const latDiff = order.pickup.lat - lat;
      const lngDiff = order.pickup.lng - lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;

      return {
        orderId: order._id.toString(),
        distance: parseFloat(distance.toFixed(2)),
        price: order.totalPrice,
      };
    });
  }

  async acceptOrder(driverId: string, orderId: string): Promise<any> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Order is not available');
    }

    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    if (!driver.isOnline) {
      throw new Error('Driver must be online to accept orders');
    }

    order.driverId = driverId;
    order.status = 'ACCEPTED';
    await order.save();

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
      throw new NotFoundException('Order not found');
    }

    // Validate status transition
    if (dto.status === 'PICKED_UP' && order.status !== 'ACCEPTED') {
      throw new Error('Order must be accepted before pickup');
    }

    if (dto.status === 'DELIVERED' && order.status !== 'PICKED_UP') {
      throw new Error('Order must be picked up before delivery');
    }

    order.status = dto.status;

    if (dto.status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
      // TODO: Update driver earnings and customer wallet if payment method is WALLET
    }

    await order.save();
  }

  async updateLocation(driverId: string, dto: UpdateLocationDto): Promise<void> {
    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    driver.location = {
      type: 'Point',
      coordinates: [dto.lng, dto.lat],
    };

    await driver.save();
  }

  async uploadDocument(driverId: string, dto: UploadDocumentDto): Promise<void> {
    const driver = await this.driverModel.findOne({ userId: driverId });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    driver.licenseImage = dto.imageUrl;
    await driver.save();
  }

  async getStats(driverId: string, from: string, to: string): Promise<StatsResponseDto> {
    const startDate = new Date(from);
    const endDate = new Date(to);

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
  ): Promise<DriverOrderHistoryResponseDto> {
    const query: any = { driverId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
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
        pickupAddress: order.pickup.address,
        dropoffAddress: order.dropoff.address,
        totalPrice: order.totalPrice,
        createdAt: (order as any).createdAt,
      })),
      meta: {
        total,
        page,
        limit,
      },
    };
  }
}
