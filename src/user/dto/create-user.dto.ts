import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    name: 'name',
    description: 'The name of a user',
    example: 'Nguyễn Văn An',
    required: true,
  })
  name: string;

  @ApiProperty({
    name: 'email',
    description: 'The email of a user',
    example: 'nguyenvan.an@gmail.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    name: 'password',
    description: 'The password of a user',
    example: 'NguyenVanAn@123',
    required: true,
  })
  password: string;

  @ApiProperty({
    name: 'age',
    description: 'The age of a user',
    example: 32,
    required: true,
  })
  age: number;
}
