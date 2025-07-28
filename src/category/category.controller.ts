import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard, AdminGuard } from 'src/auth/guard';
import { 
    CreateCategoryDto, 
    UpdateCategoryDto, 
    GetCategoriesResponseDto,
    CreateCategoryResponseDto,
    UpdateCategoryResponseDto,
    DeleteCategoryResponseDto
} from './dto';
import { CategoryService } from './category.service';

@ApiTags('categories')
@Controller('api/categories')
export class CategoryController {
    constructor(private categoryService: CategoryService) {}

    @Get()
    @ApiOperation({ 
        summary: 'Get all categories',
        description: 'Retrieve a list of all category names. Public endpoint.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Successfully retrieved all categories', 
        type: GetCategoriesResponseDto 
    })
    async getCategories(): Promise<GetCategoriesResponseDto> {
        return this.categoryService.getCategories();
    }

    @Post()
    @UseGuards(JwtGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Create a new category (Admin only)',
        description: 'Create a new product category. Requires admin privileges.'
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Category successfully created', 
        type: CreateCategoryResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 409, description: 'Conflict - Category name already exists' })
    @ApiBody({ type: CreateCategoryDto })
    async createCategory(@Body() dto: CreateCategoryDto): Promise<CreateCategoryResponseDto> {
        return this.categoryService.createCategory(dto);
    }

    @Put(':id')
    @UseGuards(JwtGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Update a category (Admin only)',
        description: 'Update an existing category name. Requires admin privileges.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Category successfully updated', 
        type: UpdateCategoryResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiResponse({ status: 409, description: 'Conflict - Category name already exists' })
    @ApiParam({ 
        name: 'id', 
        type: String, 
        description: 'Category ID to update',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({ type: UpdateCategoryDto })
    async updateCategory(
        @Param('id') categoryId: string,
        @Body() dto: UpdateCategoryDto,
    ): Promise<UpdateCategoryResponseDto> {
        return this.categoryService.updateCategory(categoryId, dto);
    }

    @Delete(':id')
    @UseGuards(JwtGuard, AdminGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
        summary: 'Delete a category (Admin only)',
        description: 'Delete an existing category. Requires admin privileges.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Category successfully deleted', 
        type: DeleteCategoryResponseDto 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    @ApiParam({ 
        name: 'id', 
        type: String, 
        description: 'Category ID to delete',
        example: '507f1f77bcf86cd799439011'
    })
    async deleteCategory(@Param('id') categoryId: string): Promise<DeleteCategoryResponseDto> {
        return this.categoryService.deleteCategory(categoryId);
    }
} 