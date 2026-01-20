import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ example: 'SUMMER2024' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Summer Sale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Get 20% off on all trips' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'PERCENTAGE', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  @IsEnum(['PERCENTAGE', 'FIXED_AMOUNT'])
  discountType: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiProperty({ example: '2024-06-01' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '2024-08-31' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: ['BIKE', 'VAN'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableVehicles?: string[];
}

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
