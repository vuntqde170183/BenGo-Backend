import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Promotion extends Document {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true })
  discountType: string;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, default: 0 })
  minOrderValue: number;

  @Prop({ type: Number })
  maxDiscountAmount: number;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Number, default: null })
  usageLimit: number;

  @Prop({ type: Number, default: 0 })
  usedCount: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  applicableVehicles: string[];
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
