import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseType, createApiResponse } from 'src/utils/response.util';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

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

    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Đăng nhập thành công',
      data: {
        accessToken: token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      },
    });
  }

  async register(registerUserDto: RegisterUserDto): Promise<ApiResponseType> {
    const user = await this.userService.createUser(registerUserDto);

    const payload = { sub: user._id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return createApiResponse({
      statusCode: HttpStatus.CREATED,
      message: 'Đăng ký tài khoản thành công',
      data: {
        accessToken: token,
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      },
    });
  }

  async getProfile(userId: string): Promise<ApiResponseType> {
    return this.userService.getProfile(userId);
  }

  async updateProfile(userId: string, dto: any): Promise<ApiResponseType> {
    return this.userService.updateProfile(userId, dto);
  }
}
