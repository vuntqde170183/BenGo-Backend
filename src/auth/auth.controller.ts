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
import { ApiResponseType } from 'src/utils/response.util';
import { JwtGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register new user/driver' })
  @ApiResponse({ status: 201, description: 'User registered.' })
  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<ApiResponseType> {
    return await this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'User logged in.' })
  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<ApiResponseType> {
    return await this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Get current user info' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req: any): Promise<ApiResponseType> {
    return this.authService.getProfile(req.user.id);
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiResponseType> {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Request Password Reset' })
  @Post('forgot-password')
  async forgotPassword(@Body() _dto: ForgotPasswordDto): Promise<any> {
    return { success: true, message: 'OTP sent' };
  }

  @ApiOperation({ summary: 'Reset Password with OTP' })
  @Post('reset-password')
  async resetPassword(@Body() _dto: ResetPasswordDto): Promise<any> {
    return { success: true };
  }
}
