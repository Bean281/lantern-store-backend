import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorate';
import { 
    CreateReviewDto, 
    UpdateReviewDto, 
    CreateReviewResponseDto,
    UpdateReviewResponseDto,
    GetReviewsResponseDto,
    DeleteReviewResponseDto,
    ReviewResponseDto
} from './dto';
import { ReviewService } from './review.service';

@ApiTags('reviews')
@Controller()
export class ReviewController {
    constructor(private reviewService: ReviewService) {}

    // POST /products/:productId/reviews – create a review for a product
    @Post('products/:productId/reviews')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Create a review for a product',
        description: 'Create a new review for a specific product. Users can only review each product once.'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Review successfully created', 
        type: CreateReviewResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 409, description: 'Conflict - You have already reviewed this product' })
    @ApiParam({ 
        name: 'productId', 
        type: String, 
        description: 'Product ID to review',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({ type: CreateReviewDto })
    async createReview(
        @Param('productId') productId: string,
        @GetUser('id') userId: string,
        @GetUser('name') userName: string,
        @Body() dto: CreateReviewDto,
    ): Promise<CreateReviewResponseDto> {
        // Use email as fallback if name is not available
        const displayName = userName || 'Anonymous User';
        return this.reviewService.createReview(productId, userId, displayName, dto);
    }

    // GET /products/:productId/reviews – get all reviews of a product
    @Get('products/:productId/reviews')
    @ApiOperation({ 
        summary: 'Get all reviews for a product',
        description: 'Retrieve all reviews for a specific product with statistics.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved product reviews', 
        type: GetReviewsResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiParam({ 
        name: 'productId', 
        type: String, 
        description: 'Product ID to get reviews for',
        example: '507f1f77bcf86cd799439011'
    })
    async getProductReviews(@Param('productId') productId: string): Promise<GetReviewsResponseDto> {
        return this.reviewService.getProductReviews(productId);
    }

    // GET /products/:productId/reviews/:reviewId – get one specific review
    @Get('products/:productId/reviews/:reviewId')
    @ApiOperation({ 
        summary: 'Get a specific review',
        description: 'Retrieve a specific review by its ID for a given product.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved the review', 
        type: ReviewResponseDto 
    })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiParam({ 
        name: 'productId', 
        type: String, 
        description: 'Product ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiParam({ 
        name: 'reviewId', 
        type: String, 
        description: 'Review ID',
        example: '507f1f77bcf86cd799439012'
    })
    async getReviewById(
        @Param('productId') productId: string,
        @Param('reviewId') reviewId: string,
    ): Promise<ReviewResponseDto> {
        return this.reviewService.getReviewById(productId, reviewId);
    }

    // PUT /reviews/:id – update a review
    @Put('reviews/:id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Update a review',
        description: 'Update an existing review. Users can only update their own reviews.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Review successfully updated', 
        type: UpdateReviewResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - You can only update your own reviews' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiParam({ 
        name: 'id', 
        type: String, 
        description: 'Review ID to update',
        example: '507f1f77bcf86cd799439012'
    })
    @ApiBody({ type: UpdateReviewDto })
    async updateReview(
        @Param('id') reviewId: string,
        @GetUser('id') userId: string,
        @Body() dto: UpdateReviewDto,
    ): Promise<UpdateReviewResponseDto> {
        return this.reviewService.updateReview(reviewId, userId, dto);
    }

    // DELETE /reviews/:id – delete a review
    @Delete('reviews/:id')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Delete a review',
        description: 'Delete an existing review. Users can only delete their own reviews, admins can delete any review.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Review successfully deleted', 
        type: DeleteReviewResponseDto 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - You can only delete your own reviews' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiParam({ 
        name: 'id', 
        type: String, 
        description: 'Review ID to delete',
        example: '507f1f77bcf86cd799439012'
    })
    async deleteReview(
        @Param('id') reviewId: string,
        @GetUser('id') userId: string,
        @GetUser('isAdmin') isAdmin: boolean,
    ): Promise<DeleteReviewResponseDto> {
        return this.reviewService.deleteReview(reviewId, userId, isAdmin);
    }
} 