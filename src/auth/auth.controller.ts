import { Body, Controller, Get, Post, Put, Req, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyRegisterDto,
} from './dto/auth.dto';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { JwtGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Đăng ký tài khoản mới (Gửi OTP)',
    description: 'API yêu cầu đăng ký tài khoản. Hệ thống sẽ gửi mã OTP qua email để xác thực trước khi tạo tài khoản chính thức.'
  })
  @ApiResponse({ status: 200, description: 'Gửi mã OTP thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tài khoản đã tồn tại' })
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<ApiResponseType> {
    return await this.authService.register(dto);
  }

  @ApiOperation({ 
    summary: 'Xác nhận mã OTP đăng ký (Tạo tài khoản)',
    description: 'API xác nhận mã OTP đã gửi qua email để chính thức tạo tài khoản người dùng.'
  })
  @ApiResponse({ status: 201, description: 'Xác thực thành công và đã tạo tài khoản' })
  @ApiResponse({ status: 400, description: 'Mã OTP không chính xác hoặc đã hết hạn' })
  @Post('verify-register')
  async verifyRegister(@Body() dto: VerifyRegisterDto): Promise<ApiResponseType> {
    return await this.authService.verifyRegistration(dto.email, dto.otp);
  }

  @ApiOperation({ 
    summary: 'Đăng nhập',
    description: 'API đăng nhập vào hệ thống bằng số điện thoại hoặc email và mật khẩu.'
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không chính xác' })
  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<ApiResponseType> {
    return await this.authService.login(dto);
  }

  @ApiOperation({ 
    summary: 'Lấy thông tin người dùng hiện tại',
    description: 'Yêu cầu access token.'
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<ApiResponseType> {
    return this.authService.getProfile(req.user.id);
  }

  @ApiOperation({ 
    summary: 'Cập nhật thông tin cá nhân'
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponseType> {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({ 
    summary: 'Yêu cầu đặt lại mật khẩu'
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<any> {
    return await this.authService.forgotPassword(dto.phone);
  }

  @ApiOperation({ 
    summary: 'Đặt lại mật khẩu với mã OTP'
  })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<any> {
    // Logic reset password thực tế cần OTP verification tương tự register
    return createApiResponse(null, 'Chức năng đang được hoàn thiện');
  }
}
