import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import {
  ConversationResponseDto,
  MessageResponseDto,
  SendMessageDto,
} from './dto/chat.dto';
import { JwtGuard } from '../auth/jwt-auth.guard';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get chat rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of conversations',
    type: [ConversationResponseDto],
  })
  async getConversations(): Promise<ConversationResponseDto[]> {
    return this.chatService.getConversations();
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages' })
  @ApiResponse({
    status: 200,
    description: 'List of messages',
    type: [MessageResponseDto],
  })
  async getMessages(
    @Param('id') id: string,
    @Query('page') page: number = 1,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.getMessages(id, Number(page));
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Send message' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<{ success: boolean; message: MessageResponseDto }> {
    return this.chatService.sendMessage(id, dto);
  }
}
