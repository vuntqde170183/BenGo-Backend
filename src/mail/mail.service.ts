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
      subject: `Order Confirmation - #${orderDetails.id}`,
      template: './order-confirmation',
      context: {
        name,
        id: orderDetails.id,
        pickup: orderDetails.pickup,
        dropoff: orderDetails.dropoff,
        price: orderDetails.price,
        vehicleType: orderDetails.vehicleType,
      },
    });
  }
}
