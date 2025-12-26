import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DriverService } from './driver.service';
import {
  PendingOrderResponseDto,
  StatsResponseDto,
  ToggleStatusDto,
  UpdateLocationDto,
  UpdateTripStatusDto,
  UploadDocumentDto,
} from './dto/driver.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('driver')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('driver')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Put('status')
  @ApiOperation({ summary: 'Toggle Online/Offline' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async toggleStatus(@Body() dto: ToggleStatusDto): Promise<{ success: boolean }> {
    await this.driverService.toggleStatus(dto);
    return { success: true };
  }

  @Get('orders/pending')
  @ApiOperation({ summary: 'Get nearby requests' })
  @ApiResponse({
    status: 200,
    description: 'List of pending orders',
    type: [PendingOrderResponseDto],
  })
  async getPendingOrders(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5,
  ): Promise<PendingOrderResponseDto[]> {
    return this.driverService.getPendingOrders(Number(lat), Number(lng), Number(radius));
  }

  @Post('orders/:id/accept')
  @ApiOperation({ summary: 'Accept a trip' })
  @ApiResponse({ status: 201, description: 'Trip accepted' })
  async acceptOrder(@Param('id') id: string): Promise<{ success: boolean; order: any }> {
    return this.driverService.acceptOrder(id);
  }

  @Put('orders/:id/update')
  @ApiOperation({ summary: 'Update trip status' })
  @ApiResponse({ status: 200, description: 'Trip status updated' })
  async updateTripStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTripStatusDto,
  ): Promise<{ success: boolean }> {
    await this.driverService.updateTripStatus(id, dto);
    return { success: true };
  }

  @Put('location')
  @ApiOperation({ summary: 'Update real-time GPS' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(@Body() dto: UpdateLocationDto): Promise<{ success: boolean }> {
    await this.driverService.updateLocation(dto);
    return { success: true };
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload documents' })
  @ApiResponse({ status: 201, description: 'Document uploaded' })
  async uploadDocument(@Body() dto: UploadDocumentDto): Promise<{ success: boolean }> {
    await this.driverService.uploadDocument(dto);
    return { success: true };
  }

  @Get('stats')
  @ApiOperation({ summary: 'View earnings/stats' })
  @ApiResponse({
    status: 200,
    description: 'Driver stats',
    type: StatsResponseDto,
  })
  async getStats(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<StatsResponseDto> {
    return this.driverService.getStats(from, to);
  }
}
