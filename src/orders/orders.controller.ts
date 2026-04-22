import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
  NearbyDriverResponseDto,
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
  SubmitDeliveryProofDto,
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

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create Stripe Payment Intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDto,
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    return this.ordersService.createPaymentIntent(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create shipping request' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  async createOrder(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'List user orders' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: OrderHistoryResponseDto,
  })
  async getHistory(
    @Req() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: string,
  ): Promise<OrderHistoryResponseDto> {
    return this.ordersService.getHistory(
      req.user.id,
      Number(page),
      Number(limit),
      status,
    );
  }

  @Get('drivers-nearby')
  @ApiOperation({ summary: 'Get nearby online drivers' })
  @ApiResponse({
    status: 200,
    description: 'List of nearby drivers',
    type: [NearbyDriverResponseDto],
  })
  async getNearbyDrivers(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5,
    @Query('vehicleType') vehicleType?: string,
  ): Promise<NearbyDriverResponseDto[]> {
    return this.ordersService.getNearbyDrivers(
      Number(lat),
      Number(lng),
      Number(radius),
      vehicleType,
    );
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
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<{ success: boolean }> {
    await this.ordersService.cancelOrder(req.user.id, id, dto);
    return { success: true };
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate driver' })
  @ApiResponse({ status: 201, description: 'Rating submitted successfully' })
  async rateDriver(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RateDriverDto,
  ): Promise<{ success: boolean }> {
    await this.ordersService.rateDriver(req.user.id, id, dto);
    return { success: true };
  }

  @Post('delivery-proof/:id')
  @ApiOperation({ summary: 'Submit delivery proof' })
  @ApiResponse({ status: 201, description: 'Delivery proof submitted successfully' })
  async submitDeliveryProof(
    @Param('id') id: string,
    @Body() dto: SubmitDeliveryProofDto,
  ): Promise<{ success: boolean }> {
    await this.ordersService.submitDeliveryProof(id, dto);
    return { success: true };
  }
}

