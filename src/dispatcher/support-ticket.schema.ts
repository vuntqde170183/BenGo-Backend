import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class SupportTicket extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: string;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' })
  status: string;

  @Prop({ type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  priority: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedTo: string;

  @Prop({ type: [String] })
  attachments: string[];
}

export const SupportTicketSchema = SchemaFactory.createForClass(SupportTicket);
