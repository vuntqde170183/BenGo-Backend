import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: string[];

  @Prop({ type: String })
  lastMessage: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
