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

export class PayOrderDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'WALLET', enum: ['WALLET', 'CASH'] })
  @IsString()
  paymentMethod: string;
}

export class CreateVnpayUrlDto {
  @ApiProperty({ example: '60d0fe4f5311236168a109ca' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'NCB' })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @ApiPropertyOptional({ example: 'vn' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'BenGo://payment-result' })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({ example: 'Payment for order #123' })
  @IsOptional()
  @IsString()
  orderInfo?: string;
}

export class CreateVnpayUrlResponseDto {
  @ApiProperty()
  paymentUrl: string;
}
