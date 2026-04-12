import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      await this.transporter.verify();
      console.log('✅ MailService: Kết nối SMTP thành công');
    } catch (error) {
      console.error('❌ MailService: Lỗi kết nối SMTP:', error);
    }
  }

  private async renderTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);

    // Kiểm tra file tồn tại (đặc biệt quan trọng trên production/dist)
    if (!fs.existsSync(templatePath)) {
      // Thử tìm trong src nếu không thấy trong dist (cho dev)
      const devPath = path.join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.hbs`);
      if (fs.existsSync(devPath)) {
        const source = fs.readFileSync(devPath, 'utf8');
        const template = handlebars.compile(source);
        return template(context);
      }
      throw new Error(`Template không tồn tại: ${templatePath}`);
    }

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  }

  async sendMail(options: { to: string; subject: string; template: string; context: any }) {
    console.log(`[MailService] Đang gửi email [${options.subject}] đến: ${options.to}`);
    try {
      const html = await this.renderTemplate(options.template, options.context);

      const info = await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM') || this.configService.get('MAIL_USER'),
        to: options.to,
        subject: options.subject,
        html,
      });

      console.log(`[MailService] Gửi email thành công: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`[MailService] Lỗi gửi email đến ${options.to}:`, error);
      throw error;
    }
  }

  async sendOrderConfirmation(email: string, name: string, orderDetails: any) {
    return this.sendMail({
      to: email,
      subject: `[BenGo] Xác nhận đặt hàng - #${orderDetails.id}`,
      template: 'order-confirmation',
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
    return this.sendMail({
      to: email,
      subject: `[BenGo] Biên lai điện tử - #${orderDetails.id}`,
      template: 'receipt',
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
    return this.sendMail({
      to: email,
      subject: `[BenGo] Thông báo kết quả duyệt hồ sơ tài xế`,
      template: 'driver-status',
      context: {
        name,
        isApproved,
        reason,
        title: isApproved ? 'Hồ sơ đã được duyệt!' : 'Hồ sơ chưa được duyệt',
      },
    });
  }

  async sendForgotPasswordOTP(email: string, name: string, otp: string) {
    return this.sendMail({
      to: email,
      subject: `[BenGo] Mã OTP khôi phục mật khẩu`,
      template: 'forgot-password',
      context: {
        name,
        otp,
      },
    });
  }

  async sendVerificationEmail(email: string, name: string, otp: string) {
    return this.sendMail({
      to: email,
      subject: `[BenGo] Mã xác minh đăng ký tài khoản`,
      template: 'verify-email',
      context: {
        name,
        otp,
      },
    });
  }
}
