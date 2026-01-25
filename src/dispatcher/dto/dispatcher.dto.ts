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
}

export class SupportTicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: string;

  @ApiProperty()
  content: string;
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
