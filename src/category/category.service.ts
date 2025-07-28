import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { 
    CreateCategoryDto, 
    UpdateCategoryDto, 
    CategoryResponseDto, 
    CreateCategoryResponseDto,
    UpdateCategoryResponseDto,
    GetCategoriesResponseDto,
    DeleteCategoryResponseDto
} from './dto';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) {}

    async getCategories(): Promise<GetCategoriesResponseDto> {
        const categories = await this.prisma.category.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        // Return only the category names as strings
        const categoryNames = categories.map(category => category.name);
        
        return { categories: categoryNames };
    }

    async createCategory(dto: CreateCategoryDto): Promise<CreateCategoryResponseDto> {
        try {
            const category = await this.prisma.category.create({
                data: {
                    name: dto.name,
                },
            });

            return {
                success: true,
                category,
            };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Category name already exists');
                }
            }
            throw error;
        }
    }

    async updateCategory(categoryId: string, dto: UpdateCategoryDto): Promise<UpdateCategoryResponseDto> {
        // Check if category exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }

        try {
            const updatedCategory = await this.prisma.category.update({
                where: {
                    id: categoryId,
                },
                data: {
                    name: dto.name,
                },
            });

            return {
                success: true,
                category: updatedCategory,
            };
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Category name already exists');
                }
            }
            throw error;
        }
    }

    async deleteCategory(categoryId: string): Promise<DeleteCategoryResponseDto> {
        // Check if category exists
        const existingCategory = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!existingCategory) {
            throw new NotFoundException('Category not found');
        }

        // Note: In a production app, you might want to check if any products 
        // are using this category before deletion
        await this.prisma.category.delete({
            where: {
                id: categoryId,
            },
        });

        return {
            success: true,
            message: 'Category deleted successfully',
        };
    }

    async getCategoryById(categoryId: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }
} 