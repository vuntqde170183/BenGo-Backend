import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  ApproveDriverDto,
  ReportsResponseDto,
  UpdatePricingDto,
  UserListResponseDto,
} from './dto/admin.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Manage users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: UserListResponseDto,
  })
  async getUsers(
    @Query('role') role: string,
    @Query('search') search: string,
  ): Promise<UserListResponseDto> {
    return this.adminService.getUsers(role, search);
  }

  @Post('drivers/approval')
  @ApiOperation({ summary: 'Approve/Reject driver' })
  @ApiResponse({ status: 200, description: 'Action completed' })
  async approveDriver(
    @Body() dto: ApproveDriverDto,
  ): Promise<{ success: boolean }> {
    await this.adminService.approveDriver(dto);
    return { success: true };
  }

  @Put('pricing')
  @ApiOperation({ summary: 'Update pricing config' })
  @ApiResponse({ status: 200, description: 'Pricing updated' })
  async updatePricing(
    @Body() dto: UpdatePricingDto,
  ): Promise<{ success: boolean }> {
    await this.adminService.updatePricing(dto);
    return { success: true };
  }

  @Get('reports')
  @ApiOperation({ summary: 'System statistics' })
  @ApiResponse({
    status: 200,
    description: 'System reports',
    type: ReportsResponseDto,
  })
  async getReports(@Query('type') type: string): Promise<ReportsResponseDto> {
    return this.adminService.getReports(type);
  }
}
