import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    description: 'Response message',
    example: 'Thao tác thành công',
  })
  message: string;

  @ApiProperty({ description: 'Response data' })
  data: T;
}

export class ApiResponsePaginationDto<T = any> extends ApiResponseDto<{
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  @ApiProperty({
    description: 'Response data with pagination',
    example: {
      items: [
        {
          id: '64a68d1f5abc123456789012',
          name: 'Nguyễn Văn An',
          email: 'nguyenvan.an@gmail.com',
          age: 32,
          createdAt: '2023-07-06T08:35:27.000Z',
          updatedAt: '2023-07-06T08:35:27.000Z',
        },
        {
          id: '64a68d1f5abc123456789013',
          name: 'Trần Thị Bình',
          email: 'tranthi.binh@gmail.com',
          age: 28,
          createdAt: '2023-07-06T09:12:45.000Z',
          updatedAt: '2023-07-06T09:12:45.000Z',
        },
      ],
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
    },
  })
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
