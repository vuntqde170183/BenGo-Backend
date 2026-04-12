import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';
import { InjectModel } from '@nestjs/mongoose';
import { PendingUser } from './pending-user.schema';
import { Model } from 'mongoose';
import { User } from '../user/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private mailService: MailService,
    @InjectModel(PendingUser.name) private pendingUserModel: Model<PendingUser>,
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

    if (!registerUserDto.email) {
      throw new HttpException('Vui lòng cung cấp email để nhận mã xác thực', HttpStatus.BAD_REQUEST);
    }

    // 2. Tạo mã OTP (4 số)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Mã hóa password trước khi lưu tạm
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // 4. Lưu vào bảng PendingUser (Ghi đè nếu đã tồn tại email/phone đang chờ duyệt)
    await this.pendingUserModel.findOneAndDelete({
      $or: [{ email: registerUserDto.email }, { phone: registerUserDto.phone }]
    });

    const pendingUser = new this.pendingUserModel({
      ...registerUserDto,
      password: hashedPassword,
      role: registerUserDto.type,
      otp,
    });
    await pendingUser.save();

    // 5. Gửi Email OTP (Không dùng await để phản hồi nhanh hơn)
    this.mailService.sendVerificationEmail(registerUserDto.email, registerUserDto.name, otp)
      .catch(err => console.error('Lỗi gửi email xác thực đăng ký:', err));

    return createApiResponse(
      null,
      'Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra để hoàn tất đăng ký.',
      HttpStatus.OK,
    );
  }

  async verifyRegistration(email: string, otp: string): Promise<ApiResponseType> {
    // 1. Tìm thông tin đăng ký tạm thời
    const pending = await this.pendingUserModel.findOne({ email, otp });
    if (!pending) {
      throw new HttpException('Mã xác thực không chính xác hoặc đã hết hạn', HttpStatus.BAD_REQUEST);
    }

    // 2. Tạo user chính thức
    const newUser = new this.userModel({
      phone: pending.phone,
      email: pending.email,
      password: pending.password,
      name: pending.name,
      role: pending.role,
    });
    await newUser.save();

    // 3. Xóa thông tin đăng ký tạm
    await this.pendingUserModel.deleteOne({ _id: pending._id });

    // 4. Tạo token và trả về kết quả như đăng nhập
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
      'Xác thực thành công và đã tạo tài khoản',
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
