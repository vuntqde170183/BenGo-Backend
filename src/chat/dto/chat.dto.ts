import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello driver!' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ example: 'TEXT', enum: ['TEXT', 'IMAGE'] })
  @IsEnum(['TEXT', 'IMAGE'])
  type: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'msg_1' })
  _id: string;

  @ApiProperty({ example: 'user_1' })
  senderId: string;

  @ApiProperty({ example: 'Hello driver!' })
  content: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  timestamp: Date;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 'conv_1' })
  roomId: string;

  @ApiProperty({ example: 'order_1' })
  orderId: string;

  @ApiProperty({ example: 'Hello...' })
  lastMessage: string;
}
