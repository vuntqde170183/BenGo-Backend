import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  })
  conversationId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, enum: ['TEXT', 'IMAGE'], default: 'TEXT' })
  type: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, createdAt: -1 });
