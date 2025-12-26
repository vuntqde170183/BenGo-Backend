import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DispatcherController } from './dispatcher.controller';
import { DispatcherService } from './dispatcher.service';
import { Order, OrderSchema } from '../orders/orders.schema';
import { Driver, DriverSchema } from '../driver/driver.schema';
import { SupportTicket, SupportTicketSchema } from './support-ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
  ],
  controllers: [DispatcherController],
  providers: [DispatcherService],
})
export class DispatcherModule {}
