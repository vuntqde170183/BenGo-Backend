import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignDriverDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  driverId: string;
}

export class OrderSummaryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  customerPhone: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  priority?: string;
}

export class DriverMapResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: any;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  phone?: string;
}

export class SupportTicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ required: false })
  orderId?: string;
}

export class UpdateTicketDto {
  @ApiProperty({
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    required: false,
    description: 'Trạng thái mới của ticket'
  })
  @IsString()
  status?: string;

  @ApiProperty({ required: false, description: 'Ghi chú hoặc giải pháp' })
  @IsString()
  note?: string;

  @ApiProperty({ required: false, description: 'Giải pháp xử lý (khi RESOLVED)' })
  @IsString()
  resolution?: string;
}

export class DashboardStatsResponseDto {
  @ApiProperty()
  totalOrders: number;
  @ApiProperty()
  pendingOrders: number;
  @ApiProperty()
  activeOrders: number;
  @ApiProperty()
  completedToday: number;
  @ApiProperty()
  onlineDrivers: number;
  @ApiProperty()
  openTickets: number;
}

export class MarkSpecialDto {
  @ApiProperty({ enum: ['NORMAL', 'VIP', 'URGENT', 'FRAGILE'] })
  @IsString()
  priority: string;

  @ApiProperty({ required: false })
  @IsString()
  specialNote?: string;

  @ApiProperty({ type: [String], required: false })
  tags?: string[];
}

export class SpecialOrderResponseDto extends OrderSummaryResponseDto {
  @ApiProperty()
  priority: string;
  @ApiProperty()
  specialNote?: string;
  @ApiProperty({ type: [String] })
  tags: string[];
}

export class DriverPerformanceResponseDto {
  @ApiProperty()
  driverId: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  totalTrips: number;
  @ApiProperty()
  completedTrips: number;
  @ApiProperty()
  cancelledTrips: number;
  @ApiProperty()
  rating: number;
  @ApiProperty()
  totalEarnings: number;
  @ApiProperty()
  acceptanceRate: number;
  @ApiProperty()
  chartData: any[];
}
