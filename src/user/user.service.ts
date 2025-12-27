import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { ApiResponseType, createApiResponse } from 'src/utils/response.util';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(data: any): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        phone: data.phone,
      });
      if (existingUser) {
        throw new HttpException(
          'Số điện thoại đã tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }

      data.password = await bcrypt.hash(data.password, 10);
      const user = new this.userModel({ ...data });
      return await user.save();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findByPhone(phone: string): Promise<User> {
    return this.userModel.findOne({ phone }).select('+password');
  }

  async findByEmailOrPhone(email?: string, phone?: string): Promise<User> {
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });
    
    if (orConditions.length === 0) return null;

    return this.userModel.findOne({ $or: orConditions }).select('+password');
  }

  async findById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async getProfile(userId: string): Promise<ApiResponseType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      return createApiResponse({
        statusCode: 200,
        data: user,
        message: 'Lấy thông tin người dùng thành công',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponseType> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        updateProfileDto,
        { new: true },
      );

      return createApiResponse({
        statusCode: 200,
        data: updatedUser,
        message: 'Cập nhật thông tin thành công',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
