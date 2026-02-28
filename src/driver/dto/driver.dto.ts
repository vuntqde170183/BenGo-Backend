import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class SimpleLocationDto {
  @ApiProperty({ example: 10.76 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.66 })
  @IsNumber()
  lng: number;
}

export class ToggleStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isOnline: boolean;

  @ApiProperty({ type: SimpleLocationDto })
  @ValidateNested()
  @Type(() => SimpleLocationDto)
  location: SimpleLocationDto;
}

export class UpdateTripStatusDto {
  @ApiProperty({ example: 'PICKED_UP', enum: ['PICKED_UP', 'DELIVERED'] })
  @IsEnum(['PICKED_UP', 'DELIVERED'])
  status: string;

  @ApiPropertyOptional({ example: 'http://proof.jpg' })
  @IsOptional()
  @IsString()
  proofImage?: string;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 10.76 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.66 })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  heading?: number;
}

export class UploadDocumentDto {
  @ApiProperty({ example: 'LICENSE', enum: ['LICENSE', 'VEHICLE'] })
  @IsEnum(['LICENSE', 'VEHICLE'])
  type: string;

  @ApiProperty({ example: 'http://doc.jpg' })
  @IsString()
  imageUrl: string;
}

export class PendingOrderResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  price: number;
}

export class StatsResponseDto {
  @ApiProperty()
  totalEarnings: number;

  @ApiProperty()
  totalTrips: number;

  @ApiProperty()
  rating: number;
}

export class DriverOrderDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  id: string;

  @ApiProperty({ example: 'ACCEPTED' })
  status: string;

  @ApiProperty({ example: '123 Pickup St, City' })
  pickupAddress: string;

  @ApiProperty({ example: '456 Dropoff St, City' })
  dropoffAddress: string;

  @ApiProperty({ example: 150000 })
  totalPrice: number;

  @ApiProperty({ example: '2023-05-15T08:30:00Z' })
  createdAt: Date;
}

export class DriverOrderHistoryResponseDto {
  @ApiProperty({ type: [DriverOrderDto] })
  data: DriverOrderDto[];

  @ApiProperty({ example: { total: 10, page: 1, limit: 10 } })
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
