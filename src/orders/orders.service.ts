import { Injectable } from '@nestjs/common';
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
  async estimatePrice(_dto: EstimatePriceDto): Promise<EstimateResponseDto> {
    return {
      distance: 5.2,
      duration: 20,
      price: 150000,
      currency: 'VND',
    };
  }

  async createOrder(_dto: CreateOrderDto): Promise<OrderResponseDto> {
    return {
      id: 'order_123',
      status: 'PENDING',
    };
  }

  async getOrder(id: string): Promise<OrderResponseDto> {
    return {
      id,
      status: 'PENDING',
    };
  }

  async cancelOrder(_id: string, _dto: CancelOrderDto): Promise<void> {
    // implementation
  }

  async rateDriver(_id: string, _dto: RateDriverDto): Promise<void> {
    // implementation
  }

  async getHistory(
    page: number,
    _limit: number,
    _status?: string,
  ): Promise<OrderHistoryResponseDto> {
    return {
      data: [],
      meta: { total: 0, page },
    };
  }
}
