import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ 
        example: 'Electronics', 
        description: 'Category name',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Category name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Category name must not exceed 50 characters' })
    name: string;
}

export class UpdateCategoryDto {
    @ApiProperty({ 
        example: 'Electronics & Gadgets', 
        description: 'Updated category name',
        minLength: 2,
        maxLength: 50
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2, { message: 'Category name must be at least 2 characters long' })
    @MaxLength(50, { message: 'Category name must not exceed 50 characters' })
    name: string;
}

export class CategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CreateCategoryResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: CategoryResponseDto })
    category: CategoryResponseDto;
}

export class UpdateCategoryResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: CategoryResponseDto })
    category: CategoryResponseDto;
}

export class GetCategoriesResponseDto {
    @ApiProperty({ 
        type: [CategoryResponseDto],
        description: 'Array of category objects with full information'
    })
    categories: CategoryResponseDto[];
}

export class DeleteCategoryResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Category deleted successfully' })
    message: string;
} 