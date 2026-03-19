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
  @ApiProperty({ example: 'DRIVING_LICENSE', enum: ['IDENTITY_FRONT', 'IDENTITY_BACK', 'DRIVING_LICENSE', 'VEHICLE_REGISTRATION', 'LICENSE', 'VEHICLE'] })
  @IsEnum(['IDENTITY_FRONT', 'IDENTITY_BACK', 'DRIVING_LICENSE', 'VEHICLE_REGISTRATION', 'LICENSE', 'VEHICLE'])
  type: string;

  @ApiProperty({ example: 'http://doc.jpg' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsString()
  @IsOptional()
  identityNumber?: string;

  @ApiPropertyOptional({ example: 'B1-123456' })
  @IsString()
  @IsOptional()
  drivingLicenseNumber?: string;

  @ApiPropertyOptional({ example: '29-A 12345' })
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'VAN', enum: ['BIKE', 'VAN', 'TRUCK'] })
  @IsString()
  @IsOptional()
  vehicleType?: string;
}

export class PendingOrderResponseDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  distance: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  pickupAddress: string;

  @ApiProperty()
  dropoffAddress: string;

  @ApiProperty()
  vehicleType: string;

  @ApiProperty()
  createdAt: Date;
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
export class DriverDocumentStatusDto {
  @ApiProperty({ example: 'IDENTITY_FRONT', enum: ['IDENTITY_FRONT', 'IDENTITY_BACK', 'DRIVING_LICENSE', 'VEHICLE_REGISTRATION'] })
  type: string;

  @ApiProperty({ example: 'http://doc.jpg', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status: string;
}

export class BankInfoDto {
  @ApiProperty({ example: 'MBBank' })
  bankName: string;

  @ApiProperty({ example: '0123456789' })
  accountNumber: string;

  @ApiProperty({ example: 'NGUYEN VAN A' })
  accountHolder: string;
}

export class DriverDocumentsResponseDto {
  @ApiProperty({ type: [DriverDocumentStatusDto] })
  documents: DriverDocumentStatusDto[];

  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'LOCKED'] })
  profileStatus: string;

  @ApiPropertyOptional({ example: 'Ảnh mờ, vui lòng chụp lại' })
  rejectionReason?: string;

  @ApiPropertyOptional({ example: 'Ghi chú nội bộ cho Admin' })
  adminNote?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  identityNumber?: string;

  @ApiPropertyOptional({ example: 'B1-123456' })
  drivingLicenseNumber?: string;

  @ApiPropertyOptional({ example: '29-A 12345' })
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'VAN' })
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A' })
  name?: string;

  @ApiPropertyOptional({ example: '0901234567' })
  phone?: string;

  @ApiPropertyOptional({ type: BankInfoDto })
  bankInfo?: BankInfoDto;
}
