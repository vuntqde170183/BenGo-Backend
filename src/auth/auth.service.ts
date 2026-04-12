import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    @InjectModel(User.name) private userModel: Model<User>,
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
    // 1. Kiểm tra xem user đã tồn tại chưa
    const existingUser = await this.userService.findByEmailOrPhone(
      registerUserDto.email,
      registerUserDto.phone,
    );
    if (existingUser) {
      throw new HttpException('Email hoặc số điện thoại đã tồn tại', HttpStatus.BAD_REQUEST);
    }

    // 2. Tạo user chính thức trực tiếp
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = new this.userModel({
      ...registerUserDto,
      password: hashedPassword,
      role: registerUserDto.type || 'CUSTOMER',
    });
    await newUser.save();

    // 3. Tạo token và trả về kết quả
    const payload = { sub: newUser._id, phone: newUser.phone, role: newUser.role };
    const token = this.jwtService.sign(payload);

    return createApiResponse(
      {
        accessToken: token,
        user: {
          id: newUser._id,
          phone: newUser.phone,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
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

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    this.mailService.sendForgotPasswordOTP(user.email, user.name, otp)
      .catch(err => console.error('Lỗi gửi email quên mật khẩu:', err));

    return createApiResponse(null, 'Mã OTP đã được gửi đến Email của bạn', HttpStatus.OK);
  }
}
