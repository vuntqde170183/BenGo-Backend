import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DispatcherService } from './dispatcher.service';
import {
  AssignDriverDto,
  DashboardStatsResponseDto,
  DriverMapResponseDto,
  DriverPerformanceResponseDto,
  MarkSpecialDto,
  OrderSummaryResponseDto,
  SpecialOrderResponseDto,
  SupportTicketResponseDto,
  UpdateTicketDto,
} from './dto/dispatcher.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('dispatcher')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('dispatcher')
export class DispatcherController {
  constructor(private readonly dispatcherService: DispatcherService) { }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, type: DashboardStatsResponseDto })
  async getDashboardStats(): Promise<DashboardStatsResponseDto> {
    return this.dispatcherService.getDashboardStats();
  }

  @Get('orders')
  @ApiOperation({ summary: 'Monitor active orders' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [OrderSummaryResponseDto],
  })
  async getOrders(
    @Query('status') status: string,
  ): Promise<OrderSummaryResponseDto[]> {
    return this.dispatcherService.getOrders(status);
  }

  @Get('orders/special')
  @ApiOperation({ summary: 'Get list of special trips' })
  @ApiResponse({ status: 200, type: [SpecialOrderResponseDto] })
  async getSpecialOrders(): Promise<SpecialOrderResponseDto[]> {
    return this.dispatcherService.getSpecialOrders();
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200 })
  async getOrderById(@Param('id') id: string): Promise<any> {
    return this.dispatcherService.getOrderById(id);
  }

  @Get('drivers/all')
  @ApiOperation({ summary: 'Get all drivers for list/reports' })
  @ApiResponse({ status: 200, type: [DriverMapResponseDto] })
  async getAllDrivers(): Promise<DriverMapResponseDto[]> {
    return this.dispatcherService.getAllDrivers();
  }

  @Post('orders/:id/mark-special')
  @ApiOperation({ summary: 'Mark an order as special' })
  @ApiResponse({ status: 200, description: 'Order marked as special' })
  async markSpecial(
    @Param('id') id: string,
    @Body() dto: MarkSpecialDto,
  ): Promise<{ success: boolean }> {
    await this.dispatcherService.markSpecial(id, dto);
    return { success: true };
  }

  @Post('orders/:id/unmark-special')
  @ApiOperation({ summary: 'Remove special mark from an order' })
  @ApiResponse({ status: 200, description: 'Order unmarked' })
  async unmarkSpecial(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.dispatcherService.unmarkSpecial(id);
    return { success: true };
  }

  @Get('drivers')
  @ApiOperation({ summary: 'View driver map' })
  @ApiResponse({
    status: 200,
    description: 'List of drivers',
    type: [DriverMapResponseDto],
  })
  async getDrivers(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
  ): Promise<DriverMapResponseDto[]> {
    return this.dispatcherService.getDrivers(
      Number(lat),
      Number(lng),
      Number(radius),
    );
  }

  @Get('drivers/:id/performance')
  @ApiOperation({ summary: 'Get driver performance' })
  @ApiResponse({ status: 200, type: DriverPerformanceResponseDto })
  async getDriverPerformance(
    @Param('id') id: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<DriverPerformanceResponseDto> {
    return this.dispatcherService.getDriverPerformance(id, from, to);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Manual assign' })
  @ApiResponse({ status: 201, description: 'Driver assigned' })
  async assignDriver(
    @Body() dto: AssignDriverDto,
  ): Promise<{ success: boolean }> {
    await this.dispatcherService.assignDriver(dto);
    return { success: true };
  }

  @Get('support')
  @ApiOperation({ summary: 'List support tickets' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets',
    type: [SupportTicketResponseDto],
  })
  async getSupportTickets(
    @Query('status') status: string,
  ): Promise<SupportTicketResponseDto[]> {
    return this.dispatcherService.getSupportTickets(status);
  }

  @Put('support/:id')
  @ApiOperation({ summary: 'Update support ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateTicket(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<{ success: boolean }> {
    await this.dispatcherService.updateTicket(id, dto);
    return { success: true };
  }
}
