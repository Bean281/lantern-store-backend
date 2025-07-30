import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { s3Client, S3_BUCKET_NAME, generateS3Url } from 'src/config/s3.config';
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
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

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(
    createProductDto: CreateProductDto,
    imageFiles?: Express.Multer.File[]
  ): Promise<CreateProductResponseDto> {
    try {
      // Parse JSON strings from form data
      const processedDto = this.processFormData(createProductDto);
      
      // Check if category exists, if not create it
      await this.ensureCategoryExists(processedDto.category);

      // Upload images to S3 if provided
      let imageUrls: string[] = [];
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await this.uploadImagesToS3(imageFiles);
      }

      const product = await this.prisma.product.create({
        data: {
          ...processedDto,
          images: imageUrls,
          inStock: processedDto.inStock ?? true,
          stockCount: processedDto.stockCount ?? 0,
          features: processedDto.features ?? [],
          specifications: processedDto.specifications ?? {},
        },
      });

      // Load images from S3 for response
      const productWithImages = await this.loadProductImages(product);

      return {
        success: true,
        product: productWithImages,
        message: 'Product created successfully',
      };
    } catch (error) {
      console.error('Create product error:', error);
      throw new BadRequestException(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    imageFiles?: Express.Multer.File[]
  ): Promise<UpdateProductResponseDto> {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Parse JSON strings from form data
      const processedDto = this.processFormData(updateProductDto);

      // Check if category exists, if not create it
      if (processedDto.category) {
        await this.ensureCategoryExists(processedDto.category);
      }

      // Handle image updates
      let finalImageUrls = existingProduct.images || [];

      // If new images provided, upload them
      if (imageFiles && imageFiles.length > 0) {
        const newImageUrls = await this.uploadImagesToS3(imageFiles);
        
        // If existingImages specified, keep only those and add new ones
        if (processedDto.existingImages && Array.isArray(processedDto.existingImages)) {
          // Delete old images that are not in existingImages list
          const imagesToDelete = existingProduct.images.filter(
            img => !processedDto.existingImages.includes(this.extractFilenameFromUrl(img))
          );
          await this.deleteImagesFromS3(imagesToDelete);
          
          // Keep only existing images that are in the list
          finalImageUrls = existingProduct.images.filter(
            img => processedDto.existingImages.includes(this.extractFilenameFromUrl(img))
          );
        } else {
          // No existing images specified, delete all old images
          await this.deleteImagesFromS3(existingProduct.images);
          finalImageUrls = [];
        }
        
        // Add new images
        finalImageUrls = [...finalImageUrls, ...newImageUrls];
      }

      // Remove existingImages from update data as it's not a Product field
      const { existingImages, ...updateData } = processedDto;

      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          ...updateData,
          images: finalImageUrls,
        },
      });

      // Load images from S3 for response
      const productWithImages = await this.loadProductImages(updatedProduct);

      return {
        success: true,
        product: productWithImages,
        message: 'Product updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Update product error:', error);
      throw new BadRequestException(`Failed to update product: ${error.message}`);
    }
  }

  async getProducts(query: GetProductsQueryDto): Promise<GetProductsResponseDto> {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Build filter conditions
    const where: any = {};

    // Search in name and description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Build sort conditions
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    try {
      // Get total count
      const total = await this.prisma.product.count({ where });

      // Get products
      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });

      // Load images from S3 for all products
      const productsWithImages = await Promise.all(
        products.map(product => this.loadProductImages(product))
      );

      const totalPages = Math.ceil(total / limit);

      return {
        products: productsWithImages,
        total,
        page,
        totalPages,
        limit,
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw new BadRequestException(`Failed to get products: ${error.message}`);
    }
  }

  async getProductById(id: string): Promise<ProductResponseDto> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              userName: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5, // Latest 5 reviews
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Load images from S3
      const productWithImages = await this.loadProductImages(product);

      return productWithImages;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Get product by ID error:', error);
      throw new BadRequestException(`Failed to get product: ${error.message}`);
    }
  }

  async deleteProduct(id: string): Promise<DeleteProductResponseDto> {
    try {
      // Check if product exists
      const existingProduct = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check if product is referenced in orders
      const orderItemsCount = await this.prisma.orderItem.count({
        where: { productId: id },
      });

      if (orderItemsCount > 0) {
        throw new BadRequestException(
          'Cannot delete product as it is referenced in existing orders. Consider marking it as out of stock instead.'
        );
      }

      // Delete images from S3
      if (existingProduct.images && existingProduct.images.length > 0) {
        await this.deleteImagesFromS3(existingProduct.images);
      }

      // Delete related reviews and cart items first
      await this.prisma.review.deleteMany({
        where: { productId: id },
      });

      await this.prisma.cartItem.deleteMany({
        where: { productId: id },
      });

      // Delete the product
      await this.prisma.product.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Product deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Delete product error:', error);
      throw new BadRequestException(`Failed to delete product: ${error.message}`);
    }
  }

  // S3 Image Management Methods
  private async uploadImagesToS3(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const file of files) {
      // Validate image file
      this.validateImageFile(file);

      // Generate unique filename
      const fileName = `${uuidv4()}_${file.originalname}`;
      const key = `images/${fileName}`;

      try {
        // Upload to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await s3Client.send(uploadCommand);

        // Generate public URL
        const url = generateS3Url(key);
        imageUrls.push(url);
      } catch (error) {
        console.error('S3 upload error:', error);
        throw new BadRequestException(`Failed to upload image ${file.originalname}: ${error.message}`);
      }
    }

    return imageUrls;
  }

  private async deleteImagesFromS3(imageUrls: string[]): Promise<void> {
    for (const imageUrl of imageUrls) {
      try {
        const key = this.extractS3KeyFromUrl(imageUrl);
        if (key) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key,
          });
          await s3Client.send(deleteCommand);
        }
      } catch (error) {
        console.error('S3 delete error:', error);
        // Don't throw error as this is cleanup operation
      }
    }
  }

  private async loadProductImages(product: any): Promise<ProductResponseDto> {
    // For now, we'll just return the stored URLs
    // In the future, you could implement signed URLs or image processing here
    return {
      ...product,
      images: product.images || [],
    } as ProductResponseDto;
  }

  private extractS3KeyFromUrl(url: string): string | null {
    try {
      // Extract key from S3 URL: https://bucket.s3.region.amazonaws.com/images/filename
      const urlParts = url.split('/');
      const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
      if (bucketIndex !== -1 && urlParts.length > bucketIndex + 1) {
        return urlParts.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }

  private extractFilenameFromUrl(url: string): string {
    try {
      const key = this.extractS3KeyFromUrl(url);
      return key ? key.split('/').pop() || '' : '';
    } catch {
      return '';
    }
  }

  private validateImageFile(file: Express.Multer.File): void {
    // Maximum image size: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Image size must be less than 5MB');
    }

    // Allowed image types
    const allowedImageTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }
  }

  private processFormData(dto: any): any {
    const processed = { ...dto };
    
    // Process features
    if (processed.features) {
      if (typeof processed.features === 'string') {
        try {
          processed.features = JSON.parse(processed.features);
        } catch {
          processed.features = [processed.features];
        }
      }
    } else {
      processed.features = [];
    }
    
    // Process specifications
    if (processed.specifications) {
      if (typeof processed.specifications === 'string') {
        try {
          processed.specifications = JSON.parse(processed.specifications);
        } catch {
          processed.specifications = {};
        }
      }
    } else {
      processed.specifications = {};
    }

    // Process existingImages
    if (processed.existingImages) {
      if (typeof processed.existingImages === 'string') {
        try {
          processed.existingImages = JSON.parse(processed.existingImages);
        } catch {
          processed.existingImages = [];
        }
      }
    }
    
    return processed;
  }

  // Existing methods remain the same
  async getCategories(): Promise<string[]> {
    try {
      const categories = await this.prisma.category.findMany({
        select: { name: true },
        orderBy: { name: 'asc' },
      });

      return categories.map(category => category.name);
    } catch (error) {
      console.error('Get categories error:', error);
      throw new BadRequestException(`Failed to get categories: ${error.message}`);
    }
  }

  async updateProductRating(productId: string): Promise<void> {
    try {
      // Calculate average rating and review count
      const reviews = await this.prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const reviewCount = reviews.length;
      const rating = reviewCount > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
        : 0;

      // Update product rating and review count
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
          reviewCount,
        },
      });
    } catch (error) {
      console.error('Update product rating error:', error);
      // Don't throw error as this is an internal operation
    }
  }

  private async ensureCategoryExists(categoryName: string): Promise<void> {
    try {
      await this.prisma.category.upsert({
        where: { name: categoryName },
        create: { name: categoryName },
        update: {},
      });
    } catch (error) {
      console.error('Ensure category exists error:', error);
      // Don't throw error as this is not critical
    }
  }

  // Utility method for admin dashboard
  async getProductStats(): Promise<{
    totalProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    averagePrice: number;
  }> {
    try {
      const [totalProducts, inStockProducts, outOfStockProducts, lowStockProducts, avgPrice] = await Promise.all([
        this.prisma.product.count(),
        this.prisma.product.count({ where: { inStock: true } }),
        this.prisma.product.count({ where: { inStock: false } }),
        this.prisma.product.count({ 
          where: { 
            inStock: true, 
            stockCount: { lte: 10 } 
          } 
        }),
        this.prisma.product.aggregate({
          _avg: { price: true },
        }),
      ]);

      return {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        averagePrice: Math.round((avgPrice._avg.price || 0) * 100) / 100,
      };
    } catch (error) {
      console.error('Get product stats error:', error);
      throw new BadRequestException(`Failed to get product statistics: ${error.message}`);
    }
  }
} 