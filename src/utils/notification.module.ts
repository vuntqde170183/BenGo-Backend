import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import {
  InvoicePayment,
  InvoicePaymentSchema,
} from '../invoice-payment/schema/invoice-payment.schema';
import { Guest, GuestSchema } from '../guest/schema/guest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvoicePayment.name, schema: InvoicePaymentSchema },
      { name: Guest.name, schema: GuestSchema },
    ]),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
