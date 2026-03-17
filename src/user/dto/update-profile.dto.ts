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

  @ApiProperty({
    name: 'email',
    description: 'Email của người dùng',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    name: 'avatar',
    description: 'Ảnh đại diện của người dùng',
    example: 'http://...',
    required: false,
  })
  avatar?: string;
}
