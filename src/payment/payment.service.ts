import { Injectable } from '@nestjs/common';
import {
  CreateQrDto,
  CreateQrResponseDto,
  SePayWebhookDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentService {
  async handleWebhook(dto: SePayWebhookDto): Promise<void> {
    // implementation
    console.log('Webhook received', dto);
  }

  async createQr(_dto: CreateQrDto): Promise<CreateQrResponseDto> {
    return {
      qrRaw: '00020101...',
      bankInfo: { bank: 'MB', acc: '0000' },
    };
  }
}
