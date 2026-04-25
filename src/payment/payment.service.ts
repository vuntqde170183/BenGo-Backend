import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as queryString from 'querystring';
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

  async payOrder(userId: string, dto: any): Promise<any> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    if (order.paymentStatus === 'PAID') {
      throw new Error('Đơn hàng đã được thanh toán');
    }

    if (dto.paymentMethod === 'WALLET') {
      const user = await this.userModel.findById(userId);
      if (!user || user.walletBalance < order.totalPrice) {
        throw new Error('Số dư ví không đủ');
      }

      user.walletBalance -= order.totalPrice;
      await user.save();

      order.paymentStatus = 'PAID';
      order.paymentMethod = 'WALLET';
      await order.save();

      return {
        success: true,
        message: 'Thanh toán bằng ví thành công',
        newBalance: user.walletBalance,
      };
    }

    // Với tiền mặt (CASH), chỉ cập nhật phương thức thanh toán
    order.paymentMethod = dto.paymentMethod;
    await order.save();
    return { success: true, message: 'Đã chọn phương thức thanh toán ' + dto.paymentMethod };
  }

  async createVnpayUrl(req: any, dto: any): Promise<any> {
    try {
      const date = new Date();
      const createDate = this.formatDate(date);
      
      const tmnCode = process.env.VNP_TMN_CODE;
      const secretKey = process.env.VNP_HASH_SECRET;
      let vnpUrl = process.env.VNP_URL;
      const returnUrl = dto.returnUrl || process.env.VNP_RETURN_URL;

      const amount = dto.amount;
      const bankCode = dto.bankCode || '';

      const locale = dto.language || 'vn';
      const currCode = 'VND';
      let vnp_Params = {};
      vnp_Params['vnp_Version'] = '2.1.0';
      vnp_Params['vnp_Command'] = 'pay';
      vnp_Params['vnp_TmnCode'] = tmnCode;
      vnp_Params['vnp_Locale'] = locale;
      vnp_Params['vnp_CurrCode'] = currCode;
      vnp_Params['vnp_TxnRef'] = dto.orderId || Date.now().toString();
      vnp_Params['vnp_OrderInfo'] = dto.orderInfo || 'Thanh toan don hang bengo';
      vnp_Params['vnp_OrderType'] = 'other';
      vnp_Params['vnp_Amount'] = amount * 100;
      vnp_Params['vnp_ReturnUrl'] = returnUrl;
      vnp_Params['vnp_IpAddr'] = '127.0.0.1';
      vnp_Params['vnp_CreateDate'] = createDate;
      if (bankCode !== null && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
      }

      vnp_Params = this.sortObject(vnp_Params);

      const signData = queryString.stringify(vnp_Params, '&', '=', {
        encodeURIComponent: (str) => str,
      });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(signData).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;
      vnpUrl += '?' + queryString.stringify(vnp_Params, '&', '=', {
        encodeURIComponent: (str) => str,
      });

      return { paymentUrl: vnpUrl };
    } catch (error) {
      console.error('Lỗi createVnpayUrl:', error);
      throw error;
    }
  }

  async handleVnpayIpn(vnp_Params: any): Promise<any> {
    try {
      const secretKey = process.env.VNP_HASH_SECRET;
      const secureHash = vnp_Params['vnp_SecureHash'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      const sortedParams = this.sortObject(vnp_Params);
      const signData = queryString.stringify(sortedParams, '&', '=', {
        encodeURIComponent: (str) => str,
      });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(signData).digest('hex');

      if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];

        if (rspCode === '00') {
          const order = await this.orderModel.findById(orderId);
          if (order && order.paymentStatus !== 'PAID') {
            order.paymentStatus = 'PAID';
            order.paymentMethod = 'VNPAY';
            await order.save();

            const amount = parseInt(vnp_Params['vnp_Amount']) / 100;
            if (order.driverId) {
              const driver = await this.userModel.findById(order.driverId);
              if (driver) {
                const driverEarning = amount * 0.8;
                driver.walletBalance += driverEarning;
                await driver.save();
              }
            }
          }
          return { RspCode: '00', Message: 'Confirm Success' };
        } else {
          return { RspCode: '00', Message: 'Confirm Success' }; 
        }
      } else {
        return { RspCode: '97', Message: 'Invalid Checksum' };
      }
    } catch (error) {
      console.error('Lỗi handleVnpayIpn:', error);
      return { RspCode: '99', Message: 'Unknow Error' };
    }
  }

  async validateVnpayResponse(vnp_Params: any): Promise<any> {
    try {
      const isDemo = vnp_Params['isDemo'];
      const secureHash = vnp_Params['vnp_SecureHash'];
      
      if (!isDemo) {
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        delete vnp_Params['isDemo'];

        const sortedParams = this.sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASH_SECRET;
        const signData = queryString.stringify(sortedParams, '&', '=', {
          encodeURIComponent: (str) => str,
        });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(signData).digest('hex');

        if (secureHash !== signed) {
          return { success: false, message: 'Chữ ký không hợp lệ' };
        }
      }

      const orderId = vnp_Params['vnp_TxnRef'];
      const responseCode = vnp_Params['vnp_ResponseCode'];

      if (responseCode === '00') {
        const order = await this.orderModel.findById(orderId);
        if (order) {
          order.paymentStatus = 'PAID';
          order.paymentMethod = 'VNPAY';
          await order.save();
          return { success: true, message: 'Thanh toán thành công', orderId };
        }
      }
      return { success: false, message: 'Thanh toán thất bại hoặc không tìm thấy đơn hàng' };
    } catch (error) {
      console.error('Lỗi validateVnpayResponse:', error);
      throw error;
    }
  }

  private sortObject(obj: any) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = encodeURIComponent(obj[key].toString()).replace(/%20/g, '+');
    });
    return sorted;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      pad(date.getMonth() + 1).toString() +
      pad(date.getDate()).toString() +
      pad(date.getHours()).toString() +
      pad(date.getMinutes()).toString() +
      pad(date.getSeconds()).toString()
    );
  }
}
