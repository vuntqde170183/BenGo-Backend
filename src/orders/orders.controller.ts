import {
  Body,
  Controller,
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
import { OrdersService } from './orders.service';
import {
  CancelOrderDto,
  CreateOrderDto,
  EstimatePriceDto,
  EstimateResponseDto,
  OrderHistoryResponseDto,
  OrderResponseDto,
  RateDriverDto,
} from './dto/orders.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('estimate')
  @ApiOperation({ summary: 'Get price estimation' })
  @ApiResponse({
    status: 200,
    description: 'Estimation calculated successfully',
    type: EstimateResponseDto,
  })
  async estimatePrice(
    @Body() dto: EstimatePriceDto,
  ): Promise<EstimateResponseDto> {
    return this.ordersService.estimatePrice(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping request' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'List user orders' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: OrderHistoryResponseDto,
  })
  async getHistory(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ): Promise<OrderHistoryResponseDto> {
    return this.ordersService.getHistory(Number(page), Number(limit), status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({
    status: 200,
    description: 'Order details',
    type: OrderResponseDto,
  })
  async getOrder(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.getOrder(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<{ success: boolean }> {
    await this.ordersService.cancelOrder(id, dto);
    return { success: true };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate driver' })
  @ApiResponse({ status: 201, description: 'Rating submitted successfully' })
  async rateDriver(
    @Param('id') id: string,
    @Body() dto: RateDriverDto,
  ): Promise<{ success: boolean }> {
    await this.ordersService.rateDriver(id, dto);
    return { success: true };
  }
}
