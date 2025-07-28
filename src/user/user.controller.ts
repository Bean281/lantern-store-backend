import { Body, Controller, Get, Put, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorate';
import { JwtGuard, AdminGuard } from 'src/auth/guard';
import { UpdateUserDto, GetUsersResponseDto, UpdateUserResponseDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@ApiTags('users')
@ApiBearerAuth()
@Controller('api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieve a list of all users. Requires admin privileges.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved all users', 
    type: GetUsersResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers(): Promise<GetUsersResponseDto> {
    return this.userService.getAllUsers();
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Update user information. Users can update their own profile, admins can update any user.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully updated', 
    type: UpdateUserResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update this user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ 
    name: 'id', 
    type: String, 
    description: 'User ID to update',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @GetUser('id') currentUserId: string,
    @GetUser('isAdmin') isCurrentUserAdmin: boolean,
    @Param('id') targetUserId: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    return this.userService.updateUser(
      currentUserId,
      targetUserId,
      isCurrentUserAdmin,
      dto,
    );
  }
} 