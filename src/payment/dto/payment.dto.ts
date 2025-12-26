import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SePayWebhookDto {
  @ApiProperty()
  @IsString()
  gateway: string;

  @ApiProperty()
  @IsString()
  transactionDate: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subAccount?: string;

  @ApiProperty()
  @IsNumber()
  transferAmount: number;

  @ApiProperty()
  @IsString()
  transferContent: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateQrDto {
  @ApiProperty({ example: 100000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'ord_123' })
  @IsString()
  orderId: string;
}

export class CreateQrResponseDto {
  @ApiProperty()
  qrRaw: string;

  @ApiProperty()
  bankInfo: any;
}
