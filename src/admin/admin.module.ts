import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../user/user.schema';
import { Driver, DriverSchema } from '../driver/driver.schema';
import { Order, OrderSchema } from '../orders/orders.schema';
import { PricingConfig, PricingConfigSchema } from './pricing-config.schema';
import { Promotion, PromotionSchema } from './promotion.schema';
import { SupportTicket, SupportTicketSchema } from '../dispatcher/support-ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: Order.name, schema: OrderSchema },
      { name: PricingConfig.name, schema: PricingConfigSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: SupportTicket.name, schema: SupportTicketSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
