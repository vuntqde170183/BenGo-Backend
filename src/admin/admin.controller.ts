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
import { createApiResponse } from '../utils/response.util';

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
  ): Promise<any> {
    await this.adminService.blockUser(id, body.blocked, body.reason);
    return createApiResponse(null, 'User block status updated successfully');
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '[ADMIN] Delete user' })
  async deleteUser(@Param('id') id: string): Promise<any> {
    await this.adminService.deleteUser(id);
    return createApiResponse(null, 'User deleted successfully');
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
  ): Promise<any> {
    await this.adminService.approveDriver(dto);
    return createApiResponse(null, 'Driver approval status updated successfully');
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
  ): Promise<any> {
    await this.adminService.forceCancelOrder(id, body.reason);
    return createApiResponse(null, 'Order cancelled successfully');
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
  ): Promise<any> {
    await this.adminService.updatePricing(dto);
    return createApiResponse(null, 'Pricing updated successfully');
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
  ): Promise<any> {
    const promotion = await this.adminService.createPromotion(dto);
    return createApiResponse(promotion, 'Promotion created successfully');
  }

  @Put('promotions/:id')
  @ApiOperation({ summary: '[ADMIN] Update promotion' })
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ): Promise<any> {
    await this.adminService.updatePromotion(id, dto);
    return createApiResponse(null, 'Promotion updated successfully');
  }

  @Delete('promotions/:id')
  @ApiOperation({ summary: '[ADMIN] Delete promotion' })
  async deletePromotion(@Param('id') id: string): Promise<any> {
    await this.adminService.deletePromotion(id);
    return createApiResponse(null, 'Promotion deleted successfully');
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
  ): Promise<any> {
    await this.adminService.assignTicket(id, body.assignedTo);
    return createApiResponse(null, 'Ticket assigned successfully');
  }

  @Put('tickets/:id/status')
  @ApiOperation({ summary: '[ADMIN] Update ticket status' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() body: { status: string; resolution?: string },
  ): Promise<any> {
    await this.adminService.updateTicketStatus(id, body.status, body.resolution);
    return createApiResponse(null, 'Ticket status updated successfully');
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
