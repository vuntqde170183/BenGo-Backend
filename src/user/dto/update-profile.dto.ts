import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    name: 'name',
    description: 'Tên của người dùng',
    example: 'Nguyễn Văn An',
    required: false,
  })
  name?: string;

  @ApiProperty({
    name: 'age',
    description: 'Tuổi của người dùng',
    example: 32,
    required: false,
  })
  age?: number;
}
