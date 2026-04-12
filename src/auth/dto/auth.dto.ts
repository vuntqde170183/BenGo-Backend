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
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'adminbengo@gmail.com',
    description: 'Email của người dùng (tùy chọn nếu dùng số điện thoại)'
  })
  @IsOptional()
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email?: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Mật khẩu của tài khoản, tối thiểu 6 ký tự'
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class RegisterUserDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại của người dùng, sử dụng để đăng nhập và nhận thông báo'
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone: string;

  @ApiProperty({
    example: 'adminbengo@gmail.com',
    description: 'Email của người dùng (tùy chọn)'
  })
  @IsOptional()
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email?: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu cho tài khoản, tối thiểu 6 ký tự'
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Họ và tên đầy đủ của người dùng'
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  name: string;

  @ApiProperty({
    example: 'CUSTOMER',
    enum: ['CUSTOMER', 'DRIVER'],
    description: 'Loại tài khoản: CUSTOMER (khách hàng) hoặc DRIVER (tài xế)'
  })
  @IsEnum(['CUSTOMER', 'DRIVER'], { message: 'Loại tài khoản phải là CUSTOMER hoặc DRIVER' })
  type: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A Updated',
    description: 'Họ và tên mới của người dùng'
  })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  name?: string;

  @ApiPropertyOptional({
    example: 'http://avatar.url',
    description: 'URL ảnh đại diện của người dùng'
  })
  @IsOptional()
  @IsString({ message: 'URL ảnh đại diện phải là chuỗi ký tự' })
  avatar?: string;

  @ApiPropertyOptional({
    example: 'email@example.com',
    description: 'Địa chỉ email của người dùng'
  })
  @IsOptional()
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email?: string;

  @ApiPropertyOptional({
    example: '0901234567',
    description: 'Số điện thoại của người dùng'
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional({
    example: { vehicleType: 'VAN', plateNumber: '29A-12345' },
    description: 'Thông tin hồ sơ tài xế'
  })
  @IsOptional()
  driverProfile?: any;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại đăng ký tài khoản, dùng để nhận mã OTP'
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại đăng ký tài khoản'
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP nhận được qua tin nhắn SMS'
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi ký tự' })
  otp: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Mật khẩu mới, tối thiểu 6 ký tự'
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}

export class VerifyRegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đã dùng để đăng ký'
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsString({ message: 'Email phải là chuỗi ký tự' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP nhận được qua email'
  })
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @IsString({ message: 'Mã OTP phải là chuỗi ký tự' })
  otp: string;
}
