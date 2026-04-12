import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserWelcome(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Welcome to BenGo! Confirm your Email',
      template: './welcome', // `.hbs` extension is appended automatically
      context: {
        name: name,
      },
    });
  }

  async sendCustomEmail(to: string, subject: string, text: string) {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendOrderConfirmation(email: string, name: string, orderDetails: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: `[BenGo] Xác nhận đặt hàng - #${orderDetails.id}`,
      template: './order-confirmation',
      context: {
        name,
        id: orderDetails.id,
        pickup: orderDetails.pickup,
        dropoff: orderDetails.dropoff,
        price: orderDetails.price.toLocaleString('vi-VN'),
        vehicleType: orderDetails.vehicleType,
      },
    });
  }

  async sendReceipt(email: string, name: string, orderDetails: any) {
    await this.mailerService.sendMail({
      to: email,
      subject: `[BenGo] Biên lai điện tử - #${orderDetails.id}`,
      template: './receipt',
      context: {
        name,
        id: orderDetails.id,
        pickup: orderDetails.pickup,
        dropoff: orderDetails.dropoff,
        price: orderDetails.price.toLocaleString('vi-VN'),
        vehicleType: orderDetails.vehicleType,
        date: new Date().toLocaleDateString('vi-VN'),
      },
    });
  }

  async sendDriverApproval(email: string, name: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const isApproved = status === 'APPROVED';
    await this.mailerService.sendMail({
      to: email,
      subject: `[BenGo] Thông báo kết quả duyệt hồ sơ tài xế`,
      template: './driver-status',
      context: {
        name,
        isApproved,
        reason,
        title: isApproved ? 'Hồ sơ đã được duyệt!' : 'Hồ sơ chưa được duyệt',
      },
    });
  }

  async sendForgotPasswordOTP(email: string, name: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: `[BenGo] Mã OTP khôi phục mật khẩu`,
      template: './forgot-password',
      context: {
        name,
        otp,
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, otp: string) {
    console.log(`[MailService] Đang gửi email xác thực đến: ${email}`);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[BenGo] Mã xác minh đăng ký tài khoản`,
        template: './verify-email',
        context: {
          name,
          otp,
        },
      });
      console.log(`[MailService] Đã gửi email xác thực thành công đến: ${email}`);
    } catch (error) {
      console.error(`[MailService] Lỗi gửi email đến ${email}:`, error);
      throw error;
    }
  }
}
