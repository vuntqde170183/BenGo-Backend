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
