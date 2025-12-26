import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreatePromotionDto, UpdatePromotionDto } from './dto/promotion.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============= USER MANAGEMENT =============
  @Get('users')
  @ApiOperation({ summary: '[ADMIN] Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: UserListResponseDto,
  })
  async getUsers(
    @Query('role') role: string,
    @Query('search') search: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<UserListResponseDto> {
    return this.adminService.getUsers(role, search, page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: '[ADMIN] Get user details' })
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/block')
  @ApiOperation({ summary: '[ADMIN] Block/Unblock user' })
  async blockUser(
    @Param('id') id: string,
    @Body() body: { blocked: boolean; reason?: string },
  ): Promise<{ success: boolean }> {
    await this.adminService.blockUser(id, body.blocked, body.reason);
    return { success: true };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '[ADMIN] Delete user' })
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.adminService.deleteUser(id);
    return { success: true };
  }

  // ============= DRIVER MANAGEMENT =============
  @Get('drivers')
  @ApiOperation({ summary: '[ADMIN] Get all drivers' })
  async getAllDrivers(@Query('status') status?: string): Promise<any> {
    return this.adminService.getAllDrivers(status);
  }

  @Post('drivers/approval')
  @ApiOperation({ summary: '[ADMIN] Approve/Reject driver' })
  @ApiResponse({ status: 200, description: 'Action completed' })
  async approveDriver(
    @Body() dto: ApproveDriverDto,
  ): Promise<{ success: boolean }> {
    await this.adminService.approveDriver(dto);
    return { success: true };
  }

  // ============= ORDER MANAGEMENT =============
  @Get('orders')
  @ApiOperation({ summary: '[ADMIN] Get all orders' })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ): Promise<any> {
    return this.adminService.getAllOrders(status, page, limit);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: '[ADMIN] Get order details' })
  async getOrderById(@Param('id') id: string): Promise<any> {
    return this.adminService.getOrderById(id);
  }

  @Put('orders/:id/cancel')
  @ApiOperation({ summary: '[ADMIN] Force cancel order' })
  async forceCancelOrder(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<{ success: boolean }> {
    await this.adminService.forceCancelOrder(id, body.reason);
    return { success: true };
  }

  // ============= PRICING CONFIGURATION =============
  @Get('pricing')
  @ApiOperation({ summary: '[ADMIN] Get pricing config' })
  async getPricing(): Promise<any> {
    return this.adminService.getPricing();
  }

  @Put('pricing')
  @ApiOperation({ summary: '[ADMIN] Update pricing config' })
  @ApiResponse({ status: 200, description: 'Pricing updated' })
  async updatePricing(
    @Body() dto: UpdatePricingDto,
  ): Promise<{ success: boolean }> {
    await this.adminService.updatePricing(dto);
    return { success: true };
  }

  // ============= PROMOTION MANAGEMENT =============
  @Get('promotions')
  @ApiOperation({ summary: '[ADMIN] Get all promotions' })
  async getAllPromotions(
    @Query('active') active?: boolean,
  ): Promise<any> {
    return this.adminService.getAllPromotions(active);
  }

  @Post('promotions')
  @ApiOperation({ summary: '[ADMIN] Create promotion' })
  async createPromotion(
    @Body() dto: CreatePromotionDto,
  ): Promise<{ success: boolean; data: any }> {
    const promotion = await this.adminService.createPromotion(dto);
    return { success: true, data: promotion };
  }

  @Put('promotions/:id')
  @ApiOperation({ summary: '[ADMIN] Update promotion' })
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<{ success: boolean }> {
    await this.adminService.updatePromotion(id, dto);
    return { success: true };
  }

  @Delete('promotions/:id')
  @ApiOperation({ summary: '[ADMIN] Delete promotion' })
  async deletePromotion(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.adminService.deletePromotion(id);
    return { success: true };
  }

  // ============= SUPPORT TICKETS / COMPLAINTS =============
  @Get('tickets')
  @ApiOperation({ summary: '[ADMIN] Get all support tickets' })
  async getAllTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
  ): Promise<any> {
    return this.adminService.getAllTickets(status, priority);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: '[ADMIN] Get ticket details' })
  async getTicketById(@Param('id') id: string): Promise<any> {
    return this.adminService.getTicketById(id);
  }

  @Put('tickets/:id/assign')
  @ApiOperation({ summary: '[ADMIN] Assign ticket to dispatcher' })
  async assignTicket(
    @Param('id') id: string,
    @Body() body: { assignedTo: string },
  ): Promise<{ success: boolean }> {
    await this.adminService.assignTicket(id, body.assignedTo);
    return { success: true };
  }

  @Put('tickets/:id/status')
  @ApiOperation({ summary: '[ADMIN] Update ticket status' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
  ): Promise<{ success: boolean }> {
    await this.adminService.updateTicketStatus(id, body.status, body.resolution);
    return { success: true };
  }

  // ============= REPORTS & STATISTICS =============
  @Get('reports')
  @ApiOperation({ summary: '[ADMIN] System statistics & reports' })
  @ApiResponse({
    status: 200,
    description: 'System reports',
    type: ReportsResponseDto,
  })
  async getReports(@Query('type') type: string): Promise<ReportsResponseDto> {
    return this.adminService.getReports(type);
  }

  @Get('dashboard')
  @ApiOperation({ summary: '[ADMIN] Dashboard overview' })
  async getDashboard(): Promise<any> {
    return this.adminService.getDashboard();
  }
}
