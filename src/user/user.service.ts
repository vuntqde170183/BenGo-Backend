import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { ApiResponseType, createApiResponse } from '../utils/response.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Driver } from '../driver/driver.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
  ) { }

  async createUser(data: any): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        $or: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      });
      if (existingUser) {
        if (existingUser.phone === data.phone) {
          throw new HttpException(
            'Số điện thoại đã tồn tại',
            HttpStatus.BAD_REQUEST,
          );
        }
        if (data.email && existingUser.email === data.email) {
          throw new HttpException(
            'Email đã tồn tại',
            HttpStatus.BAD_REQUEST,
          );
        }
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

      let userData = user.toObject() as any;
      if (userData.role === 'DRIVER') {
        const driver = await this.driverModel.findOne({ userId });
        if (driver) {
          userData.driverProfile = driver.toObject();
        }
      }

      return createApiResponse(
        userData,
        'Lấy thông tin người dùng thành công',
        200,
      );
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

      const anyDto = updateProfileDto as any;

      if (anyDto.phone && anyDto.phone !== user.phone) {
        const existingPhone = await this.userModel.findOne({ phone: anyDto.phone });
        if (existingPhone) {
          throw new HttpException(
            'Số điện thoại đã tồn tại',
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const { driverProfile, ...userUpdates } = anyDto;

      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        userUpdates,
        { new: true },
      );

      if (driverProfile && updatedUser.role === 'DRIVER') {
        const existingDriver = await this.driverModel.findOne({ userId });
        if (existingDriver) {
          await this.driverModel.findOneAndUpdate(
            { userId },
            { $set: driverProfile },
            { new: true }
          );
        } else {
          const newDriver = new this.driverModel({
            ...driverProfile,
            userId,
          });
          await newDriver.save();
        }
      }

      return this.getProfile(userId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
