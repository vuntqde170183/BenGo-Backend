import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PricingConfig extends Document {
  @Prop({ type: Number, required: true, default: 15000 })
  basePrice: number;

  @Prop({ type: Number, required: true, default: 5000 })
  perKm: number;

  @Prop({ type: Number, required: true, default: 1.5 })
  peakHourMultiplier: number;

  @Prop({ type: String, enum: ['BIKE', 'VAN', 'TRUCK'], required: true })
  vehicleType: string;
}

export const PricingConfigSchema = SchemaFactory.createForClass(PricingConfig);
