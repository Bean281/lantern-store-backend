import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { 
    CreateReviewDto, 
    UpdateReviewDto, 
    ReviewResponseDto, 
    CreateReviewResponseDto,
    UpdateReviewResponseDto,
    GetReviewsResponseDto,
    DeleteReviewResponseDto
} from './dto';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) {}

    async createReview(
        productId: string, 
        userId: string, 
        userName: string, 
        dto: CreateReviewDto
    ): Promise<CreateReviewResponseDto> {
        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Check if user already reviewed this product
        const existingReview = await this.prisma.review.findFirst({
            where: {
                productId,
                userId,
            },
        });

        if (existingReview) {
            throw new ConflictException('You have already reviewed this product');
        }

        try {
            const review = await this.prisma.review.create({
                data: {
                    productId,
                    userId,
                    userName,
                    rating: dto.rating,
                    comment: dto.comment,
                },
            });

            // Update product rating and review count
            await this.updateProductRating(productId);

            return {
                success: true,
                review,
                message: 'Review created successfully',
            };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new ConflictException('Failed to create review');
            }
            throw error;
        }
    }

    async getProductReviews(productId: string): Promise<GetReviewsResponseDto> {
        // Check if product exists
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const reviews = await this.prisma.review.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });

        const total = reviews.length;
        const averageRating = total > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / total 
            : 0;

        return {
            reviews,
            total,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        };
    }

    async getReviewById(productId: string, reviewId: string): Promise<ReviewResponseDto> {
        const review = await this.prisma.review.findFirst({
            where: {
                id: reviewId,
                productId,
            },
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    async updateReview(
        reviewId: string, 
        userId: string, 
        dto: UpdateReviewDto
    ): Promise<UpdateReviewResponseDto> {
        // Check if review exists and belongs to user
        const existingReview = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            throw new NotFoundException('Review not found');
        }

        if (existingReview.userId !== userId) {
            throw new ForbiddenException('You can only update your own reviews');
        }

        try {
            const updatedReview = await this.prisma.review.update({
                where: { id: reviewId },
                data: {
                    rating: dto.rating,
                    comment: dto.comment,
                },
            });

            // Update product rating and review count
            await this.updateProductRating(existingReview.productId);

            return {
                success: true,
                review: updatedReview,
                message: 'Review updated successfully',
            };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                throw new ConflictException('Failed to update review');
            }
            throw error;
        }
    }

    async deleteReview(reviewId: string, userId: string, isAdmin: boolean): Promise<DeleteReviewResponseDto> {
        // Check if review exists
        const existingReview = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            throw new NotFoundException('Review not found');
        }

        // Check if user can delete this review (owner or admin)
        if (existingReview.userId !== userId && !isAdmin) {
            throw new ForbiddenException('You can only delete your own reviews');
        }

        await this.prisma.review.delete({
            where: { id: reviewId },
        });

        // Update product rating and review count
        await this.updateProductRating(existingReview.productId);

        return {
            success: true,
            message: 'Review deleted successfully',
        };
    }

    private async updateProductRating(productId: string): Promise<void> {
        const reviews = await this.prisma.review.findMany({
            where: { productId },
            select: { rating: true },
        });

        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
            : 0;

        await this.prisma.product.update({
            where: { id: productId },
            data: {
                rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
                reviewCount,
            },
        });
    }
} 