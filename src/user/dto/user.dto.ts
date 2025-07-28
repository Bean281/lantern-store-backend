import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email address', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;
}

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false })
    name?: string | null;

    @ApiProperty()
    isAdmin: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class UpdateUserResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}

export class GetUsersResponseDto {
    @ApiProperty({ type: [UserResponseDto] })
    users: UserResponseDto[];
} 