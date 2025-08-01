import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  IsObject, 
  Min, 
  IsInt,
  ArrayNotEmpty
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ 
    description: 'Product name',
    example: 'MacBook Pro 14-inch' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Product price in USD',
    example: 1999.99 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ 
    description: 'Original price (for showing discounts)',
    example: 2199.99,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ 
    description: 'Product category',
    example: 'Electronics' 
  })
  @IsString()
  category: string;

  @ApiProperty({ 
    description: 'Product description',
    example: 'Powerful laptop with M2 chip' 
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Array of product features (JSON string)',
    example: '["M2 chip", "16GB RAM", "512GB SSD"]',
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  features?: string[] | string;

  @ApiProperty({ 
    description: 'Product specifications as JSON string',
    example: '{"Screen Size": "14-inch", "RAM": "16GB", "Storage": "512GB"}',
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  specifications?: Record<string, string> | string;

  @ApiProperty({ 
    description: 'Whether product is in stock',
    example: 'true',
    default: 'true' 
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ 
    description: 'Stock count',
    example: '50',
    default: '0' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockCount?: number;
}

export class UpdateProductDto {
  @ApiProperty({ 
    description: 'Product name',
    example: 'MacBook Pro 14-inch',
    required: false 
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Product price in USD',
    example: 1999.99,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ 
    description: 'Original price (for showing discounts)',
    example: 2199.99,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ 
    description: 'Product category',
    example: 'Electronics',
    required: false 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    description: 'Product description',
    example: 'Powerful laptop with M2 chip',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Array of product features (JSON string)',
    example: '["M2 chip", "16GB RAM", "512GB SSD"]',
    required: false
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  features?: string[] | string;

  @ApiProperty({ 
    description: 'Product specifications as JSON string',
    example: '{"Screen Size": "14-inch", "RAM": "16GB", "Storage": "512GB"}',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return value;
    }
  })
  specifications?: Record<string, string> | string;

  @ApiProperty({ 
    description: 'Whether product is in stock',
    example: 'true',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ 
    description: 'Stock count',
    example: '50',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockCount?: number;

  @ApiProperty({ 
    description: 'Existing image URLs to keep (JSON string array)',
    example: '["image1.jpg", "image2.jpg"]',
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      if (Array.isArray(value)) {
        return value;
      }
      return [];
    } catch {
      return [];
    }
  })
  @IsArray()
  @IsString({ each: true })
  existingImages?: string[];
}

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Original price', required: false })
  originalPrice?: number;

  @ApiProperty({ description: 'Product images loaded from S3', type: [String] })
  images: string[];

  @ApiProperty({ description: 'Product category' })
  category: string;

  @ApiProperty({ description: 'Product description' })
  description: string;

  @ApiProperty({ description: 'Product features', type: [String] })
  features: string[];

  @ApiProperty({ description: 'Product specifications' })
  specifications: Record<string, string>;

  @ApiProperty({ description: 'In stock status' })
  inStock: boolean;

  @ApiProperty({ description: 'Stock count' })
  stockCount: number;

  @ApiProperty({ description: 'Average rating' })
  rating: number;

  @ApiProperty({ description: 'Number of reviews' })
  reviewCount: number;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class GetProductsQueryDto {
  @ApiProperty({ 
    description: 'Search term for product name/description',
    required: false,
    example: 'MacBook' 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Filter by category',
    required: false,
    example: 'Electronics' 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    description: 'Minimum price filter',
    required: false,
    example: 100 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ 
    description: 'Maximum price filter',
    required: false,
    example: 5000 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ 
    description: 'Sort by field',
    required: false,
    enum: ['name', 'price', 'rating', 'createdAt'],
    example: 'price' 
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';

  @ApiProperty({ 
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'asc' 
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ 
    description: 'Page number',
    required: false,
    default: 1,
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    description: 'Items per page',
    required: false,
    default: 10,
    example: 10 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class GetProductsResponseDto {
  @ApiProperty({ 
    description: 'Array of products',
    type: [ProductResponseDto] 
  })
  products: ProductResponseDto[];

  @ApiProperty({ description: 'Total number of products' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;
}

export class CreateProductResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Created product', type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class UpdateProductResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Updated product', type: ProductResponseDto })
  product: ProductResponseDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class DeleteProductResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;
} 