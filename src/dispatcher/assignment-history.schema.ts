import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class AssignmentHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  orderId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Driver', required: true })
  driverId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  dispatcherId: string;

  @Prop({
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS',
  })
  status: string;

  @Prop({ type: String })
  note: string;
}

export const AssignmentHistorySchema = SchemaFactory.createForClass(AssignmentHistory);
AssignmentHistorySchema.index({ createdAt: -1 });
AssignmentHistorySchema.index({ dispatcherId: 1 });
AssignmentHistorySchema.index({ orderId: 1 });
AssignmentHistorySchema.index({ driverId: 1 });
