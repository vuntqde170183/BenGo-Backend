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

  @ApiProperty({ enum: ['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER'], example: 'CUSTOMER' })
  @IsEnum(['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER'])
  role: string;

  @ApiProperty({ example: true })
  active: boolean;
}
