import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class AuthDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', description: 'User password' })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
    @IsString()
    @IsOptional()
    name?: string;
}

export class UserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false })
    name?: string | null; // Allow both null and undefined to match Prisma

    @ApiProperty()
    isAdmin: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class AuthResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;

    @ApiProperty({ required: false })
    token?: string;
}

export class LogoutResponseDto {
    @ApiProperty()
    success: boolean;
}

export class MeResponseDto {
    @ApiProperty({ type: UserResponseDto })
    user: UserResponseDto;
}