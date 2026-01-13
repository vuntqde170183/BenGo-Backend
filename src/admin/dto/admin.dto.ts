import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class UpdateDriverStatusDto {
  @ApiProperty({ 
    description: 'ID của tài xế cần cập nhật trạng thái',
    example: '694eea39736c474360b86b15'
  })
  @IsString()
  driverId: string;

  @ApiProperty({ 
    enum: ['APPROVED', 'PENDING', 'LOCKED', 'REJECTED'],
    description: 'Trạng thái mới của tài xế: APPROVED (đã duyệt), PENDING (chờ duyệt), LOCKED (đã khóa), REJECTED (từ chối)',
    example: 'APPROVED'
  })
  @IsEnum(['APPROVED', 'PENDING', 'LOCKED', 'REJECTED'])
  status: string;

  @ApiProperty({ 
    required: false,
    description: 'Lý do từ chối hoặc khóa tài xế (bắt buộc khi status là REJECTED hoặc LOCKED)',
    example: 'Hồ sơ không đầy đủ'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ 
    required: false,
    description: 'Ghi chú thêm từ admin',
    example: 'Cần bổ sung giấy phép lái xe hạng B2'
  })
  @IsOptional()
  @IsString()
  note?: string;
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

export class CreateUserDto {
  @ApiProperty({ example: 'Bui Tran Thien An' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'buitranthienan2222@gmail.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Customer123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: '0936985327' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiProperty({ enum: ['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'], example: 'CUSTOMER' })
  @IsEnum(['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'])
  role: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    required: false,
    enum: ['BIKE', 'TRUCK', 'VAN'],
    description: 'Bắt buộc nếu role là DRIVER',
    example: 'BIKE'
  })
  @IsOptional()
  @IsEnum(['BIKE', 'TRUCK', 'VAN'])
  vehicleType?: string;

  @ApiProperty({
    required: false,
    description: 'Bắt buộc nếu role là DRIVER',
    example: '59-S2 123.45'
  })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @ApiProperty({ example: 5, required: false, description: 'Điểm đánh giá tài xế (chỉ dành cho DRIVER)' })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ 
    required: false, 
    description: 'URL ảnh giấy phép lái xe (chỉ dành cho DRIVER)',
    example: 'https://example.com/license.jpg'
  })
  @IsOptional()
  @IsString()
  licenseImage?: string;

  @ApiProperty({ example: '123456789012', required: false, description: 'Số CCCD/CMND (chỉ dành cho DRIVER)' })
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @ApiProperty({ 
    required: false, 
    description: 'URL ảnh mặt trước CCCD (chỉ dành cho DRIVER)',
    example: 'https://example.com/id-front.jpg'
  })
  @IsOptional()
  @IsString()
  identityFrontImage?: string;

  @ApiProperty({ 
    required: false, 
    description: 'URL ảnh mặt sau CCCD (chỉ dành cho DRIVER)',
    example: 'https://example.com/id-back.jpg'
  })
  @IsOptional()
  @IsString()
  identityBackImage?: string;

  @ApiProperty({ 
    required: false, 
    description: 'URL ảnh đăng ký xe (chỉ dành cho DRIVER)',
    example: 'https://example.com/vehicle-reg.jpg'
  })
  @IsOptional()
  @IsString()
  vehicleRegistrationImage?: string;

  @ApiProperty({ example: 'B2-12345678', required: false, description: 'Số giấy phép lái xe (chỉ dành cho DRIVER)' })
  @IsOptional()
  @IsString()
  drivingLicenseNumber?: string;

  @ApiProperty({ 
    required: false,
    description: 'Thông tin tài khoản ngân hàng (chỉ dành cho DRIVER)',
    example: { bankName: 'Vietcombank', accountNumber: '1234567890', accountHolder: 'Nguyen Van A' }
  })
  @IsOptional()
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}
