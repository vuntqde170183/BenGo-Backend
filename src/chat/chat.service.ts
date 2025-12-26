import { Injectable } from '@nestjs/common';
import {
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageDto,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  async getConversations(): Promise<ConversationResponseDto[]> {
    return [{ roomId: 'conv_1', orderId: 'order_1', lastMessage: 'Hello' }];
  }

  async getMessages(_id: string, _page: number): Promise<MessageResponseDto[]> {
    return [
      {
        _id: 'msg_1',
        senderId: 'user_1',
        content: 'Hello',
        timestamp: new Date(),
      },
    ];
  }

  async sendMessage(
    _id: string,
    dto: SendMessageDto,
  ): Promise<{ success: boolean; message: MessageResponseDto }> {
    return {
      success: true,
      message: {
        _id: 'msg_new',
        senderId: 'me',
        content: dto.content,
        timestamp: new Date(),
      },
    };
  }
}
