import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LocationDto {
  @ApiProperty({ example: 10.762622 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 106.660172 })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ example: '123 Street, HCM' })
  @IsOptional()
  @IsString()
  address?: string;
}

export class EstimatePriceDto {
  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @ApiProperty({ example: 'VAN' })
  @IsString()
  vehicleType: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @ApiProperty({ example: 'VAN' })
  @IsString()
  vehicleType: string;

  @ApiProperty({ example: ['http://img1.jpg'] })
  @IsArray()
  @IsString({ each: true })
  goodsImages: string[];

  @ApiPropertyOptional({ example: 'Fragile content' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'STRIPE' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 150000 })
  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 150000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'vnd' })
  @IsString()
  currency: string;
}

export class PaymentIntentResponseDto {
  @ApiProperty({ example: 'pi_...' })
  client_secret: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Driver took too long' })
  @IsString()
  reason: string;
}

export class RateDriverDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  star: number;

  @ApiPropertyOptional({ example: 'Good service' })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class EstimateResponseDto {
  @ApiProperty({ example: 5.2 })
  distance: number;

  @ApiProperty({ example: 15 })
  duration: number;

  @ApiProperty({ example: 150000 })
  price: number;

  @ApiProperty({ example: 'VND' })
  currency: string;
}

export class OrderResponseDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  id: string;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiPropertyOptional()
  pickup?: LocationDto;

  @ApiPropertyOptional()
  dropoff?: LocationDto;

  @ApiPropertyOptional({ example: 'VAN' })
  vehicleType?: string;

  @ApiPropertyOptional({ example: 150000 })
  totalPrice?: number;

  @ApiPropertyOptional({ example: 5.2 })
  distanceKm?: number;

  @ApiPropertyOptional({ example: 'CASH' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'UNPAID' })
  paymentStatus?: string;

  @ApiPropertyOptional({ example: ['http://img1.jpg'] })
  goodsImages?: string[];

  @ApiPropertyOptional({ example: '2024-03-20T10:00:00.000Z' })
  createdAt?: string;

  @ApiPropertyOptional()
  driver?: {
    name: string;
    phone: string;
    avatar?: string;
    rating?: number;
  };

  @ApiPropertyOptional()
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };

  @ApiPropertyOptional()
  trackingPath?: any;
}

export class OrderHistoryResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiPropertyOptional()
  pagination?: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
  };
}

export class NearbyDriverResponseDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  id: string;

  @ApiProperty({ example: 'VAN' })
  vehicleType: string;

  @ApiProperty({ example: { lat: 10.762622, lng: 106.660172 } })
  location: { lat: number; lng: number };

  @ApiProperty({ example: 4.8 })
  rating: number;
}

