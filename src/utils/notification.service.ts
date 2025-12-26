import { Injectable, Logger } from '@nestjs/common';
import { ApiResponseType, createApiResponse } from 'src/utils/response.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoicePayment } from '../invoice-payment/schema/invoice-payment.schema';
import { Guest } from '../guest/schema/guest.schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(InvoicePayment.name)
    private invoicePaymentModel: Model<InvoicePayment>,
    @InjectModel(Guest.name) private guestModel: Model<Guest>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendPaymentReminders(): Promise<ApiResponseType> {
    this.logger.debug('Đang gửi nhắc nhở thanh toán...');

    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEnd = new Date(now.setHours(23, 59, 59, 999));

    const duePayments = await this.invoicePaymentModel
      .find({
        datePaymentRemind: { $gte: todayStart, $lte: todayEnd },
        statusPaym: 1,
      })
      .populate({
        path: 'homeContractId',
        populate: {
          path: 'guestId',
        },
      })
      .populate({
        path: 'serviceContractId',
        populate: {
          path: 'guestId',
        },
      })
      .exec();

    // Gửi thông báo cho từng hóa đơn
    for (const payment of duePayments) {
      // Lấy thông tin khách hàng
      let guest = null;

      if (payment.homeContractId && payment.homeContractId['guestId']) {
        guest = payment.homeContractId['guestId'];
      } else if (
        payment.serviceContractId &&
        payment.serviceContractId['guestId']
      ) {
        guest = payment.serviceContractId['guestId'];
      }

      if (guest) {
        // Gửi email thông báo
        if (guest.email) {
          this.sendEmailNotification(guest.email, payment);
        }

        // Gửi SMS thông báo
        if (guest.phone) {
          this.sendSmsNotification(guest.phone, payment);
        }
      }
    }

    this.logger.debug(
      `Đã gửi ${duePayments.length} thông báo nhắc nhở thanh toán`,
    );

    return createApiResponse({
      statusCode: 200,
      message: `Đã gửi ${duePayments.length} thông báo nhắc nhở thanh toán`,
      data: {
        notificationsSent: duePayments.length,
        paymentIds: duePayments.map((payment) => payment._id),
      },
    });
  }

  private async sendEmailNotification(email: string, payment: InvoicePayment) {
    // Thông tin khoản thanh toán
    const paymentDate = payment.datePaymentExpec.toISOString().substring(0, 10);
    const amount = payment.totalReceive;

    // Loại hợp đồng
    const contractType = payment.homeContractId
      ? 'Hợp đồng nhà'
      : 'Hợp đồng dịch vụ';

    // Nội dung email
    const subject = `Nhắc nhở thanh toán - Đến hạn ngày ${paymentDate}`;
    const content = `
      Kính gửi Quý khách,
      
      Chúng tôi xin trân trọng thông báo khoản thanh toán cho ${contractType} của quý khách sẽ đến hạn vào ngày ${paymentDate}.
      
      Thông tin thanh toán:
      - Số tiền: ${amount} VNĐ
      - Hạn thanh toán: ${paymentDate}
      
      Vui lòng thanh toán đúng hạn để tránh ảnh hưởng đến dịch vụ.
      
      Trân trọng,
      Ban quản lý.
    `;

    // Code gửi email thực tế sẽ được triển khai ở đây
    // Có thể sử dụng nodemailer hoặc các dịch vụ gửi email khác
    this.logger.debug(`Đã gửi email đến ${email}: ${subject}`);
  }

  private async sendSmsNotification(phone: string, payment: InvoicePayment) {
    // Thông tin khoản thanh toán
    const paymentDate = payment.datePaymentExpec.toISOString().substring(0, 10);
    const amount = payment.totalReceive;

    // Nội dung SMS
    const message = `Thong bao: Khoan thanh toan ${amount} VND se den han vao ngay ${paymentDate}. Vui long thanh toan dung han.`;

    // Code gửi SMS thực tế sẽ được triển khai ở đây
    // Có thể sử dụng Twilio hoặc các dịch vụ gửi SMS khác
    this.logger.debug(`Đã gửi SMS đến ${phone}: ${message}`);
  }
}
