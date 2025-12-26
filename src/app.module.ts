import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationModule } from './utils/notification.module';
import { UploadModule } from './upload/upload.module';
import { OrdersModule } from './orders/orders.module';
import { ChatModule } from './chat/chat.module';
import { DriverModule } from './driver/driver.module';
import { PaymentModule } from './payment/payment.module';
import { DispatcherModule } from './dispatcher/dispatcher.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    NotificationModule,
    UploadModule,
    OrdersModule,
    ChatModule,
    DriverModule,
    PaymentModule,
    DispatcherModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
