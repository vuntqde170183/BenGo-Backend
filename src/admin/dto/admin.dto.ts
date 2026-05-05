import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class BankInfoDto {
  @ApiProperty({ example: 'Vietcombank', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  accountHolder: string;
}

export class DriverProfileDto {
  @ApiProperty({
    enum: ['BIKE', 'TRUCK', 'VAN'],
    description: 'Loại phương tiện',
    example: 'BIKE'
  })
  @IsEnum(['BIKE', 'TRUCK', 'VAN'])
  vehicleType: string;

  @ApiProperty({
    description: 'Biển số xe',
    example: '59-S2 123.45'
  })
  @IsString()
  plateNumber: string;

  @ApiProperty({ example: 5, required: false, description: 'Điểm đánh giá' })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({
    required: false,
    description: 'URL ảnh giấy phép lái xe',
    example: 'https://example.com/license.jpg'
  })
  @IsOptional()
  @IsString()
  licenseImage?: string;

  @ApiProperty({ example: '123456789012', required: false, description: 'Số CCCD/CMND' })
  @IsOptional()
  @IsString()
  identityNumber?: string;

  @ApiProperty({
    required: false,
    description: 'URL ảnh mặt trước CCCD',
    example: 'https://example.com/id-front.jpg'
  })
  @IsOptional()
  @IsString()
  identityFrontImage?: string;

  @ApiProperty({
    required: false,
    description: 'URL ảnh mặt sau CCCD',
    example: 'https://example.com/id-back.jpg'
  })
  @IsOptional()
  @IsString()
  identityBackImage?: string;

  @ApiProperty({
    required: false,
    description: 'URL ảnh đăng ký xe',
    example: 'https://example.com/vehicle-reg.jpg'
  })
  @IsOptional()
  @IsString()
  vehicleRegistrationImage?: string;

  @ApiProperty({ example: 'B2-12345678', required: false, description: 'Số giấy phép lái xe' })
  @IsOptional()
  @IsString()
  drivingLicenseNumber?: string;

  @ApiProperty({
    required: false,
    description: 'Thông tin tài khoản ngân hàng',
    type: BankInfoDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BankInfoDto)
  bankInfo?: BankInfoDto;
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
  revenue: {
    daily: number;
    monthly: number;
    total: number;
    byVehicleType: {
      BIKE: number;
      VAN: number;
      TRUCK: number;
    };
    byPaymentMethod?: {
      CASH: number;
      WALLET: number;
      QR: number;
    };
    chartData: {
      date: string;
      value: number;
    }[];
  };

  @ApiPropertyOptional()
  topDrivers?: {
    driverId: string;
    name: string;
    revenue: number;
    completedOrders: number;
    rating: number;
  }[];

  @ApiPropertyOptional()
  orderStats?: {
    total: number;
    completed: number;
    cancelled: number;
  };
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

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @ApiProperty({
    required: false,
    description: 'Hồ sơ tài xế (chỉ dành cho role DRIVER)',
    type: DriverProfileDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DriverProfileDto)
  driverProfile?: DriverProfileDto;

  // Giữ lại các trường cũ để tương thích ngược nếu cần
  @ApiProperty({
    required: false,
    enum: ['BIKE', 'TRUCK', 'VAN'],
    description: 'Bắt buộc nếu role là DRIVER (nếu không dùng driverProfile)',
    example: 'BIKE'
  })
  @IsOptional()
  @IsEnum(['BIKE', 'TRUCK', 'VAN'])
  vehicleType?: string;

  @ApiProperty({
    required: false,
    description: 'Bắt buộc nếu role là DRIVER (nếu không dùng driverProfile)',
    example: '59-S2 123.45'
  })
  @IsOptional()
  @IsString()
  plateNumber?: string;

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

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
    example: 'DELIVERED',
    description: 'Trạng thái mới của đơn hàng',
    required: false
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'])
  status?: string;

  @ApiProperty({
    enum: ['UNPAID', 'PAID'],
    example: 'PAID',
    description: 'Trạng thái thanh toán mới',
    required: false
  })
  @IsOptional()
  @IsEnum(['UNPAID', 'PAID'])
  paymentStatus?: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: ['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'],
    description: 'Vai trò mới của người dùng',
    example: 'DISPATCHER'
  })
  @IsEnum(['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'])
  role: string;

  @ApiProperty({
    required: false,
    description: 'Lý do thay đổi vai trò (tùy chọn)',
    example: 'Thăng chức lên điều phối viên'
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    required: false,
    description: 'Thông tin tài xế (bắt buộc nếu chuyển sang role DRIVER)',
    type: DriverProfileDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DriverProfileDto)
  driverProfile?: DriverProfileDto;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Nguyen Van A', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: 100000, required: false })
  @IsOptional()
  @IsNumber()
  walletBalance?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  active?: boolean;

  @ApiProperty({
    enum: ['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'],
    example: 'DISPATCHER',
    required: false,
    description: 'Vai trò của người dùng (nếu muốn thay đổi role, nên dùng endpoint /admin/users/:id/role)'
  })
  @IsOptional()
  @IsEnum(['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER', 'SUPERADMIN'])
  role?: string;
}

