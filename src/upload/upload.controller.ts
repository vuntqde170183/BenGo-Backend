import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { createApiResponse, ApiResponseType } from '../utils/response.util';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiOperation({ summary: 'Upload hình ảnh lên Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh cần upload (jpg, jpeg, png, gif)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Upload thành công',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Upload hình ảnh thành công' },
        data: {
          type: 'object',
          properties: {
            public_id: { type: 'string', example: 'real-estate/abc123' },
            url: {
              type: 'string',
              example:
                'https://res.cloudinary.com/dtm3qtje7/image/upload/v1234567890/real-estate/abc123.jpg',
            },
            width: { type: 'number', example: 800 },
            height: { type: 'number', example: 600 },
            format: { type: 'string', example: 'jpg' },
            bytes: { type: 'number', example: 102400 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi validation hoặc file không hợp lệ',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException(
              'Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponseType> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để upload');
    }

    try {
      const result = await this.uploadService.uploadImage(file);

      return createApiResponse({
        statusCode: HttpStatus.OK,
        message: 'Upload hình ảnh thành công',
        data: result,
      });
    } catch (error) {
      throw new BadRequestException(`Lỗi upload hình ảnh: ${error.message}`);
    }
  }
}
