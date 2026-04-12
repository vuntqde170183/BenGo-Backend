import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PendingUser extends Document {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ default: Date.now, index: { expires: '10m' } })
  createdAt: Date;
}

export const PendingUserSchema = SchemaFactory.createForClass(PendingUser);
