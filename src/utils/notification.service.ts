import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async createNotification(userId: string, title: string, message: string, type: string = 'ORDER_STATUS', data: any = null) {
    this.logger.debug(`Creating notification for ${userId}: ${title} - ${message}`);
    const notification = new this.notificationModel({
      userId,
      title,
      message,
      type,
      data,
    });
    return notification.save();
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    this.logger.debug(
      `Sending push notification to ${token}: ${title} - ${body}`,
    );
    // Future: implement FCM sending here
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { isRead: true }).exec();
  }
}
