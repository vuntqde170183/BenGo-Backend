import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponseType, createApiResponse } from 'src/utils/response.util';
import { LoginUserDto, RegisterUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginUserDto: LoginUserDto): Promise<ApiResponseType> {
    const payload = { sub: 'mock_id', phone: loginUserDto.phone };
    const token = this.jwtService.sign(payload);

    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Login successful (Mock)',
      data: {
        accessToken: token,
        user: { id: 'mock_id', phone: loginUserDto.phone, name: 'Mock User' },
      },
    });
  }

  async register(registerUserDto: RegisterUserDto): Promise<ApiResponseType> {
    const payload = { sub: 'mock_id', phone: registerUserDto.phone };
    const token = this.jwtService.sign(payload);

    return createApiResponse({
      statusCode: HttpStatus.CREATED,
      data: {
        accessToken: token,
        user: { id: 'mock_id', phone: registerUserDto.phone, name: registerUserDto.name },
      },
      message: 'User registered successfully (Mock)',
    });
  }
}
