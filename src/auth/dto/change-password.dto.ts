import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    name: 'currentPassword',
    description: 'Mật khẩu hiện tại của người dùng',
    example: 'Password@123',
    required: true,
  })
  currentPassword: string;

  @ApiProperty({
    name: 'newPassword',
    description: 'Mật khẩu mới của người dùng',
    example: 'NewPassword@123',
    required: true,
  })
  newPassword: string;
}
