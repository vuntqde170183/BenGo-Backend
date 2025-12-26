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
  driver?: any; 
  @ApiPropertyOptional()
  trackingPath?: any;
}

export class OrderHistoryResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data: OrderResponseDto[];

  @ApiProperty({ example: { total: 10, page: 1 } })
  meta: any;
}
