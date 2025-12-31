import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginUserDto {
  @ApiPropertyOptional({ 
    example: '0901234567',
    description: 'Số điện thoại của người dùng (tùy chọn nếu dùng email)'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    example: 'adminbengo@gmail.com',
    description: 'Email của người dùng (tùy chọn nếu dùng số điện thoại)'
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ 
    example: 'Admin123!',
    description: 'Mật khẩu của tài khoản, tối thiểu 6 ký tự'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterUserDto {
  @ApiProperty({ 
    example: '0901234567',
    description: 'Số điện thoại của người dùng, sử dụng để đăng nhập và nhận thông báo'
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ 
    example: '123456',
    description: 'Mật khẩu cho tài khoản, tối thiểu 6 ký tự'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'Nguyen Van A',
    description: 'Họ và tên đầy đủ của người dùng'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    example: 'CUSTOMER', 
    enum: ['CUSTOMER', 'DRIVER'],
    description: 'Loại tài khoản: CUSTOMER (khách hàng) hoặc DRIVER (tài xế)'
  })
  @IsEnum(['CUSTOMER', 'DRIVER'])
  type: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ 
    example: 'Nguyen Van A Updated',
    description: 'Họ và tên mới của người dùng'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ 
    example: 'http://avatar.url',
    description: 'URL ảnh đại diện của người dùng'
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ 
    example: 'email@example.com',
    description: 'Địa chỉ email của người dùng'
  })
  @IsOptional()
  @IsString()
  email?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    example: '0901234567',
    description: 'Số điện thoại đăng ký tài khoản, dùng để nhận mã OTP'
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    example: '0901234567',
    description: 'Số điện thoại đăng ký tài khoản'
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ 
    example: '123456',
    description: 'Mã OTP nhận được qua tin nhắn SMS'
  })
  @IsNotEmpty()
  @IsString()
  otp: string;

  @ApiProperty({ 
    example: 'newpassword123',
    description: 'Mật khẩu mới, tối thiểu 6 ký tự'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
