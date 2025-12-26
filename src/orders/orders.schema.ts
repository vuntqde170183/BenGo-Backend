import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
class Location {
  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lng: number;
}

const LocationSchema = SchemaFactory.createForClass(Location);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  customerId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  driverId: string;

  @Prop({ type: LocationSchema, required: true })
  pickup: Location;

  @Prop({ type: LocationSchema, required: true })
  dropoff: Location;

  @Prop({ type: String, required: true })
  vehicleType: string;

  @Prop({ type: [String] })
  goodsImages: string[];

  @Prop({
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: Number, required: true })
  distanceKm: number;

  @Prop({ type: String, enum: ['CASH', 'WALLET'], default: 'CASH' })
  paymentMethod: string;

  @Prop({ type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' })
  paymentStatus: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ createdAt: -1 });
