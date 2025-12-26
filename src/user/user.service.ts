import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiResponseType, createApiResponse } from 'src/utils/response.util';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<ApiResponseType> {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (existingUser) {
        throw new HttpException('Email đã tồn tại', HttpStatus.BAD_REQUEST);
      }

      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const user = new this.userModel({ ...createUserDto });
      return createApiResponse({
        statusCode: 201,
        data: await user.save(),
        message: 'User created successfully',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async fetchUsersByName(name: string): Promise<ApiResponseType> {
    try {
      const users = await this.userModel
        .find({ name: { $regex: name } })
        .exec();
      return createApiResponse({
        statusCode: 200,
        data: users,
        message: 'Users fetched successfully',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).select('+password');
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

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponseType> {
    try {
      const user = await this.userModel.findById(userId).select('+password');
      if (!user) {
        throw new HttpException(
          'Người dùng không tồn tại',
          HttpStatus.NOT_FOUND,
        );
      }

      const isPasswordMatch = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isPasswordMatch) {
        throw new HttpException(
          'Mật khẩu hiện tại không đúng',
          HttpStatus.BAD_REQUEST,
        );
      }

      const hashedNewPassword = await bcrypt.hash(
        changePasswordDto.newPassword,
        10,
      );
      user.password = hashedNewPassword;
      await user.save();

      return createApiResponse({
        statusCode: 200,
        message: 'Thay đổi mật khẩu thành công',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseType> {
    try {
      const userExists = await this.userModel.exists({ _id: id });
      if (!userExists) {
        return createApiResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });
      return createApiResponse({
        statusCode: 200,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteUser(id: string): Promise<ApiResponseType> {
    try {
      const userExists = await this.userModel.exists({ _id: id });
      if (!userExists) {
        return createApiResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }
      await this.userModel.findByIdAndDelete(id);
      return createApiResponse({
        statusCode: 200,
        message: 'User deleted successfully',
      });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
