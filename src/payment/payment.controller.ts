import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
  CreateQrDto,
  CreateQrResponseDto,
  PayOrderDto,
  SePayWebhookDto,
  CreateVnpayUrlDto,
  CreateVnpayUrlResponseDto,
} from './dto/payment.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook for SePay' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Body() dto: SePayWebhookDto,
  ): Promise<{ success: boolean }> {
    await this.paymentService.handleWebhook(dto);
    return { success: true };
  }

  @Post('create-qr')
  @ApiOperation({ summary: 'Create VietQR string' })
  @ApiResponse({
    status: 201,
    description: 'QR Created',
    type: CreateQrResponseDto,
  })
  async createQr(@Body() dto: CreateQrDto): Promise<CreateQrResponseDto> {
    return this.paymentService.createQr(dto);
  }

  @Post('pay')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Thực hiện thanh toán đơn hàng bằng ví điện tử' })
  @ApiResponse({ status: 200, description: 'Thanh toán thành công' })
  async payOrder(@Req() req: any, @Body() dto: PayOrderDto): Promise<any> {
    return this.paymentService.payOrder(req.user.id, dto);
  }

  @Post('create-vnpay-url')
  @ApiOperation({ summary: 'Tạo URL thanh toán VNPay' })
  @ApiResponse({
    status: 201,
    description: 'URL Created',
    type: CreateVnpayUrlResponseDto,
  })
  async createVnpayUrl(
    @Req() req: any,
    @Body() dto: CreateVnpayUrlDto,
  ): Promise<CreateVnpayUrlResponseDto> {
    return this.paymentService.createVnpayUrl(req, dto);
  }

  @Get('vnpay-ipn')
  @ApiOperation({ summary: 'VNPay IPN Callback' })
  async vnpayIpn(@Req() req: any): Promise<any> {
    try {
      return await this.paymentService.handleVnpayIpn(req.query);
    } catch (error) {
      console.error('IPN Error:', error);
      return { RspCode: '99', Message: 'Unknown Error' };
    }
  }

  @Post('vnpay-verify')
  @ApiOperation({ summary: 'Verify VNPay payment result from App' })
  async vnpayVerify(@Body() dto: any): Promise<any> {
    try {
      return await this.paymentService.validateVnpayResponse(dto);
    } catch (error) {
      console.error('Verify Error:', error);
      throw error;
    }
  }
}
