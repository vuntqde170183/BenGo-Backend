import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { User } from 'src/user/user.schema';

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
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(): Promise<any> { // Replace any with proper User interface
    // In a real app, you'd extract user from Request
    return { id: 1, name: 'Demo User', role: 'CUSTOMER' }; 
  }

  @ApiOperation({ summary: 'Update profile' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Body() dto: UpdateProfileDto): Promise<any> {
    return { success: true, user: dto };
  }

  @ApiOperation({ summary: 'Request Password Reset' })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<any> {
    return { success: true, message: 'OTP sent' };
  }

  @ApiOperation({ summary: 'Reset Password with OTP' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<any> {
    return { success: true };
  }
}
