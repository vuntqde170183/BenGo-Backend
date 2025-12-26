import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class UpdatePricingDto {
  @ApiProperty()
  @IsNumber()
  basePrice: number;

  @ApiProperty()
  @IsNumber()
  perKm: number;

  @ApiProperty()
  @IsNumber()
  peakHourMultiplier: number;
}

export class ApproveDriverDto {
  @ApiProperty()
  @IsString()
  driverId: string;

  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsEnum(['APPROVE', 'REJECT'])
  action: string;
}

export class UserListResponseDto {
  @ApiProperty()
  data: any[];

  @ApiProperty()
  meta: any;
}

export class ReportsResponseDto {
  @ApiProperty()
  revenue: any;
}
