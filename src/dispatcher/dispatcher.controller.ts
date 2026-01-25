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
  DriverMapResponseDto,
  OrderSummaryResponseDto,
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
