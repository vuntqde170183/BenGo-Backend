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
