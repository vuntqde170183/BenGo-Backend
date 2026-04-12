import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
  ) { }

  async login(loginUserDto: LoginUserDto): Promise<ApiResponseType> {
    const user = await this.userService.findByEmailOrPhone(
      loginUserDto.email,
      loginUserDto.phone,
    );
    if (!user) {
      throw new HttpException(
        'Tài khoản không tồn tại',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isPasswordMatch = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException(
        'Mật khẩu không chính xác',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { sub: user._id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return createApiResponse(
      {
        accessToken: token,
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Đăng nhập thành công',
      HttpStatus.OK,
    );
  }

  async register(registerUserDto: RegisterUserDto): Promise<ApiResponseType> {
    const user = await this.userService.createUser(registerUserDto);

    const payload = { sub: user._id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return createApiResponse(
      {
        accessToken: token,
        user: {
          id: user._id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Đăng ký tài khoản thành công',
      HttpStatus.CREATED,
    );
  }

  async getProfile(userId: string): Promise<ApiResponseType> {
    return this.userService.getProfile(userId);
  }

  async updateProfile(userId: string, dto: any): Promise<ApiResponseType> {
    return this.userService.updateProfile(userId, dto);
  }

  async forgotPassword(phone: string): Promise<ApiResponseType> {
    const user = await this.userService.findByPhone(phone);
    if (!user) {
      throw new HttpException('Số điện thoại không tồn tại trong hệ thống', HttpStatus.NOT_FOUND);
    }

    if (!user.email) {
      throw new HttpException('Tài khoản này chưa liên kết Email để nhận mã OTP', HttpStatus.BAD_REQUEST);
    }

    // Tạo mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Ở đây thực tế nên lưu OTP vào Redis hoặc Database kèm thời gian hết hạn
    // Tạm thời ta gửi qua Mail phục vụ demo
    await this.mailService.sendForgotPasswordOTP(user.email, user.name, otp);

    return createApiResponse(null, 'Mã OTP đã được gửi đến Email của bạn', HttpStatus.OK);
  }
}
