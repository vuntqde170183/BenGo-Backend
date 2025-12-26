import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class Driver extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string | User;

  @Prop({ type: String, enum: ['BIKE', 'TRUCK', 'VAN'], required: true })
  vehicleType: string;

  @Prop({ type: String, required: true })
  plateNumber: string;

  @Prop({ type: [String] })
  licenseImages: string[];

  @Prop({ type: Boolean, default: false })
  isOnline: boolean;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  })
  location: { type: string; coordinates: number[] };

  @Prop({
    type: String,
    enum: ['PENDING_APPROVAL', 'APPROVED', 'LOCKED'],
    default: 'PENDING_APPROVAL',
  })
  status: string;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
DriverSchema.index({ location: '2dsphere' });
