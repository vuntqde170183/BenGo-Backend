import { Injectable } from '@nestjs/common';
import { AssignDriverDto, DriverMapResponseDto, OrderSummaryResponseDto, SupportTicketResponseDto } from './dto/dispatcher.dto';

@Injectable()
export class DispatcherService {
  async getOrders(status: string): Promise<OrderSummaryResponseDto[]> {
    return [{ id: 'ord_1', from: 'A', to: 'B', status: status || 'PENDING' }];
  }

  async getDrivers(lat: number, lng: number, radius: number): Promise<DriverMapResponseDto[]> {
    return [
        { id: 'drv_1', name: 'Driver A', location: { lat: 10, lng: 106 }, status: 'ONLINE' }
    ];
  }

  async assignDriver(dto: AssignDriverDto): Promise<void> {
    // implementation
  }

  async getSupportTickets(status: string): Promise<SupportTicketResponseDto[]> {
    return [
        { id: 'tix_1', user: 'User A', content: 'Help' }
    ];
  }
}
