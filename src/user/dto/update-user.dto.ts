import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    name: 'name',
    description: 'The name of a user',
    example: 'Nguyễn Văn An',
    required: false,
  })
  name: string;

  @ApiProperty({
    name: 'email',
    description: 'The email of a user',
    example: 'nguyenvan.an@gmail.com',
    required: false,
  })
  email: string;

  @ApiProperty({
    name: 'age',
    description: 'The age of a user',
    example: 32,
    required: false,
  })
  age: number;
}
