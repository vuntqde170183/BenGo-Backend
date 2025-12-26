import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';
import { Driver, DriverSchema } from './driver.schema';
import { Order, OrderSchema } from '../orders/orders.schema';
import { User, UserSchema } from '../user/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DriverController],
  providers: [DriverService],
})
export class DriverModule {}
