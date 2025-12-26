import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import {
  CreateQrDto,
  CreateQrResponseDto,
  SePayWebhookDto,
} from './dto/payment.dto';

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
}
