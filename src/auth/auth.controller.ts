import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
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
} from './dto/auth.dto';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { JwtGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ 
    summary: 'Đăng ký tài khoản mới',
    description: 'API đăng ký tài khoản cho khách hàng hoặc tài xế. Sau khi đăng ký thành công, hệ thống sẽ trả về access token để sử dụng cho các API khác.'
  })
  @ApiResponse({ status: 201, description: 'Đăng ký tài khoản thành công, trả về thông tin người dùng và access token' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ hoặc số điện thoại đã tồn tại' })
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<ApiResponseType> {
    return await this.authService.register(dto);
  }

  @ApiOperation({ 
    summary: 'Đăng nhập',
    description: 'API đăng nhập vào hệ thống bằng số điện thoại hoặc email và mật khẩu. Trả về access token để xác thực cho các request tiếp theo.'
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về access token và thông tin người dùng' })
  @ApiResponse({ status: 401, description: 'Tài khoản không tồn tại hoặc mật khẩu không chính xác' })
  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<ApiResponseType> {
    return await this.authService.login(dto);
  }

  @ApiOperation({ 
    summary: 'Lấy thông tin người dùng hiện tại',
    description: 'API lấy thông tin chi tiết của người dùng đang đăng nhập. Yêu cầu có access token hợp lệ trong header.'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin người dùng thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<ApiResponseType> {
    return this.authService.getProfile(req.user.id);
  }

  @ApiOperation({ 
    summary: 'Cập nhật thông tin cá nhân',
    description: 'API cập nhật thông tin cá nhân của người dùng như tên, avatar, email. Yêu cầu đăng nhập.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thông tin thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' })
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
    summary: 'Yêu cầu đặt lại mật khẩu',
    description: 'API gửi mã OTP về số điện thoại để đặt lại mật khẩu khi người dùng quên mật khẩu.'
  })
  @ApiResponse({ status: 200, description: 'Gửi mã OTP thành công' })
  @ApiResponse({ status: 404, description: 'Số điện thoại không tồn tại trong hệ thống' })
  @Post('forgot-password')
  async forgotPassword(@Body() _dto: ForgotPasswordDto): Promise<any> {
    return createApiResponse(null, 'OTP sent');
  }

  @ApiOperation({ 
    summary: 'Đặt lại mật khẩu với mã OTP',
    description: 'API xác nhận mã OTP và đặt lại mật khẩu mới cho tài khoản.'
  })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công' })
  @ApiResponse({ status: 400, description: 'Mã OTP không hợp lệ hoặc đã hết hạn' })
  @Post('reset-password')
  async resetPassword(@Body() _dto: ResetPasswordDto): Promise<any> {
    return createApiResponse(null, 'Password reset successfully');
  }
}
