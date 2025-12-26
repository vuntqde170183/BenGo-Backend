import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateQrDto,
  CreateQrResponseDto,
  SePayWebhookDto,
} from './dto/payment.dto';
import { Order } from '../orders/orders.schema';
import { User } from '../user/user.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async handleWebhook(dto: SePayWebhookDto): Promise<void> {
    const { orderId, amount, status, transactionId } = dto as any;

    if (status === 'SUCCESS' || status === 'PAID') {
      const order = await this.orderModel.findById(orderId);

      if (order) {
        order.paymentStatus = 'PAID';
        await order.save();

        if (order.paymentMethod === 'WALLET') {
          const customer = await this.userModel.findById(order.customerId);
          if (customer) {
            customer.walletBalance -= amount;
            await customer.save();
          }

          if (order.driverId) {
            const driver = await this.userModel.findById(order.driverId);
            if (driver) {
              const driverEarning = amount * 0.8;
              driver.walletBalance += driverEarning;
              await driver.save();
            }
          }
        }
      }
    } 
  }

  async createQr(dto: CreateQrDto): Promise<CreateQrResponseDto> {
    const { amount, orderId, bankCode, accountNumber } = dto as any;

    const qrData = {
      version: '01',
      method: '12', // Dynamic QR
      merchantAccount: accountNumber || '0000000000',
      amount: amount || 0,
      currency: '704', // VND
      reference: orderId || 'ORDER_' + Date.now(),
      description: `BenGo Order Payment`,
    };

    const qrRaw = `00020101021238${bankCode || 'MB'}${accountNumber}0208QRIBFTTA53037045802VN62${qrData.reference}6304`;

    return {
      qrRaw,
      bankInfo: {
        bank: bankCode || 'MB',
        acc: accountNumber || '0000000000',
      },
    };
  }
}
