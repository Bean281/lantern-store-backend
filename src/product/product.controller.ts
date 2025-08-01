import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { JwtGuard, AdminGuard } from 'src/auth/guard';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductsQueryDto,
  ProductResponseDto,
  GetProductsResponseDto,
  CreateProductResponseDto,
  UpdateProductResponseDto,
  DeleteProductResponseDto,
} from './dto';

@ApiTags('products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all products with filtering and pagination',
    description: 'Retrieve products with optional search, category filter, price range, sorting, and pagination. Images are loaded from S3.'
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Search term for product name/description',
    example: 'MacBook' 
  })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    description: 'Filter by category',
    example: 'Electronics' 
  })
  @ApiQuery({ 
    name: 'minPrice', 
    required: false, 
    description: 'Minimum price filter',
    example: 100 
  })
  @ApiQuery({ 
    name: 'maxPrice', 
    required: false, 
    description: 'Maximum price filter',
    example: 5000 
  })
  @ApiQuery({ 
    name: 'sortBy', 
    required: false, 
    description: 'Sort by field',
    enum: ['name', 'price', 'rating', 'createdAt'],
    example: 'price' 
  })
  @ApiQuery({ 
    name: 'sortOrder', 
    required: false, 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'asc' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number',
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Items per page',
    example: 10 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Products retrieved successfully with S3 images loaded', 
    type: GetProductsResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid query parameters' })
  async getProducts(@Query(ValidationPipe) query: GetProductsQueryDto): Promise<GetProductsResponseDto> {
    return this.productService.getProducts(query);
  }

  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all product categories',
    description: 'Retrieve a list of all available product categories'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { type: 'string' },
      example: ['Electronics', 'Clothing', 'Books']
    }
  })
  async getCategories(): Promise<string[]> {
    return this.productService.getCategories();
  }

  @Get('stats')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get product statistics (Admin only)',
    description: 'Retrieve product statistics for admin dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducts: { type: 'number', example: 150 },
        inStockProducts: { type: 'number', example: 120 },
        outOfStockProducts: { type: 'number', example: 30 },
        lowStockProducts: { type: 'number', example: 15 },
        averagePrice: { type: 'number', example: 299.99 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getProductStats() {
    return this.productService.getProductStats();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get product by ID',
    description: 'Retrieve a single product by its ID with recent reviews and images loaded from S3'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product retrieved successfully with S3 images loaded', 
    type: ProductResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid product ID format' })
  async getProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create new product with images (Admin only)',
    description: 'Create a new product with automatic S3 image upload. Upload images as multipart form data along with product details.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'MacBook Pro 14-inch' },
        price: { type: 'number', example: 1999.99 },
        originalPrice: { type: 'number', example: 2199.99 },
        category: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'Powerful laptop with M2 chip' },
        features: { type: 'string', example: '["M2 chip", "16GB RAM", "512GB SSD"]' },
        specifications: { type: 'string', example: '{"Screen Size": "14-inch", "RAM": "16GB"}' },
        inStock: { type: 'string', example: 'true' },
        stockCount: { type: 'string', example: '50' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Product images (max 10 files, 5MB each)'
        },
      },
      required: ['name', 'price', 'category', 'description']
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Product created successfully with images uploaded to S3', 
    type: CreateProductResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid product data or image validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ): Promise<CreateProductResponseDto> {
    return this.productService.createProduct(createProductDto, images);
  }

  @Put(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update product with images (Admin only)',
    description: 'Update an existing product. New images will be uploaded to S3. Specify existingImages to keep existing ones, otherwise all old images will be replaced.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ 
    name: 'id', 
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiBody({
    schema: {
      type: 'object',
              properties: {
          name: { type: 'string', example: 'MacBook Pro 14-inch' },
          price: { type: 'string', example: '1999.99' },
          originalPrice: { type: 'string', example: '2199.99' },
          category: { type: 'string', example: 'Electronics' },
          description: { type: 'string', example: 'Powerful laptop with M2 chip' },
          features: { type: 'string', example: '["M2 chip", "16GB RAM", "512GB SSD"]' },
          specifications: { type: 'string', example: '{"Screen Size": "14-inch", "RAM": "16GB"}' },
          inStock: { type: 'string', example: 'true' },
          stockCount: { type: 'string', example: '50' },
          existingImages: { 
            type: 'string', 
            example: '["image1.jpg", "image2.jpg"]',
            description: 'Filenames of existing images to keep (JSON array string)'
          },
          images: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
            description: 'New product images to upload (max 10 files, 5MB each)'
          },
        },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product updated successfully with S3 image management', 
    type: UpdateProductResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid product data or image validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images?: Express.Multer.File[]
  ): Promise<UpdateProductResponseDto> {
    return this.productService.updateProduct(id, updateProductDto, images);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete product (Admin only)',
    description: 'Delete a product and its associated S3 images. Cannot delete products that are referenced in existing orders.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Product and associated S3 images deleted successfully', 
    type: DeleteProductResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Product cannot be deleted (referenced in orders)' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async deleteProduct(@Param('id') id: string): Promise<DeleteProductResponseDto> {
    return this.productService.deleteProduct(id);
  }
} 