import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: ['ORDER_STATUS', 'SYSTEM', 'PAYMENT'], default: 'ORDER_STATUS' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: Object })
  data: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
