import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateReviewDto {
    @ApiProperty({ 
        example: 5, 
        description: 'Rating from 1 to 5 stars',
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must not exceed 5' })
    rating: number;

    @ApiProperty({ 
        example: 'Great product! Highly recommended.', 
        description: 'Review comment',
        minLength: 10,
        maxLength: 1000
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'Comment must be at least 10 characters long' })
    @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
    comment: string;
}

export class UpdateReviewDto {
    @ApiProperty({ 
        example: 4, 
        description: 'Updated rating from 1 to 5 stars',
        minimum: 1,
        maximum: 5
    })
    @IsInt()
    @Min(1, { message: 'Rating must be at least 1' })
    @Max(5, { message: 'Rating must not exceed 5' })
    rating: number;

    @ApiProperty({ 
        example: 'Updated review comment.', 
        description: 'Updated review comment',
        minLength: 10,
        maxLength: 1000
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(10, { message: 'Comment must be at least 10 characters long' })
    @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
    comment: string;
}

export class ReviewResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    productId: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    userName: string;

    @ApiProperty({ minimum: 1, maximum: 5 })
    rating: number;

    @ApiProperty()
    comment: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class CreateReviewResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: ReviewResponseDto })
    review: ReviewResponseDto;

    @ApiProperty({ example: 'Review created successfully' })
    message: string;
}

export class UpdateReviewResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: ReviewResponseDto })
    review: ReviewResponseDto;

    @ApiProperty({ example: 'Review updated successfully' })
    message: string;
}

export class GetReviewsResponseDto {
    @ApiProperty({ type: [ReviewResponseDto] })
    reviews: ReviewResponseDto[];

    @ApiProperty({ example: 25, description: 'Total number of reviews' })
    total: number;

    @ApiProperty({ example: 4.2, description: 'Average rating' })
    averageRating: number;
}

export class DeleteReviewResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Review deleted successfully' })
    message: string;
} 