import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, unique: true, index: true })
  phone: string;

  @Prop({ type: String, unique: true, sparse: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    enum: ['CUSTOMER', 'DRIVER', 'ADMIN', 'DISPATCHER'],
    default: 'CUSTOMER',
  })
  role: string;

  @Prop({ type: String })
  avatar: string;

  @Prop({ type: Number, default: 0 })
  walletBalance: number;

  @Prop({ type: Number, default: 5 })
  rating: number;

  @Prop({ type: String })
  fcmToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
