import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssignDriverDto,
  DriverMapResponseDto,
  OrderSummaryResponseDto,
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
  ) {}

  async getOrders(status: string): Promise<OrderSummaryResponseDto[]> {
    const query: any = {};
    
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const orders = await this.orderModel
      .find(query)
      .populate('customerId', 'name phone')
      .populate('driverId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return orders.map(order => ({
      id: order._id.toString(),
      from: order.pickup.address || `${order.pickup.lat}, ${order.pickup.lng}`,
      to: order.dropoff.address || `${order.dropoff.lat}, ${order.dropoff.lng}`,
      status: order.status,
    }));
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

    return tickets.map(ticket => ({
      id: ticket._id.toString(),
      user: (ticket.userId as any)?.name || 'Unknown User',
      content: ticket.content,
    }));
  }
}
