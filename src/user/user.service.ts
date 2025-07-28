import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UserResponseDto, GetUsersResponseDto, UpdateUserResponseDto } from './dto';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<GetUsersResponseDto> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Remove password field from all users
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return { users: sanitizedUsers };
  }

  async updateUser(
    currentUserId: string,
    targetUserId: string,
    isCurrentUserAdmin: boolean,
    dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    // Check if user can update this profile
    if (currentUserId !== targetUserId && !isCurrentUserAdmin) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Check if target user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id: targetUserId,
        },
        data: {
          ...dto,
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;

      return {
        success: true,
        user: userWithoutPassword,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already taken');
        }
      }
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<{ user: UserResponseDto }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword };
  }
} 