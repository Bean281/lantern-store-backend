import { 
    Body, 
    Controller, 
    Post, 
    Delete, 
    Param, 
    UseGuards, 
    UseInterceptors, 
    UploadedFiles 
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtGuard, AdminGuard } from 'src/auth/guard';
import { 
    UploadFilesResponseDto,
    UploadImagesResponseDto,
    DeleteFileResponseDto,
    DeleteImageResponseDto,
    DeleteImageDto
} from './dto';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller('api/upload')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
export class UploadController {
    constructor(private uploadService: UploadService) {}

    @Post()
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiOperation({ 
        summary: 'Upload files (Admin only)',
        description: 'Upload multiple files to AWS S3. Maximum 10 files, each up to 10MB.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ 
        status: 201, 
        description: 'Files uploaded successfully', 
        type: UploadFilesResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid files or file validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadFilesResponseDto> {
        return this.uploadService.uploadFiles(files);
    }

    @Post('images')
    @UseInterceptors(FilesInterceptor('images', 10))
    @ApiOperation({ 
        summary: 'Upload images (Admin only)',
        description: 'Upload multiple image files to AWS S3. Maximum 10 images, each up to 5MB. Only image formats allowed.'
    })
    @ApiConsumes('multipart/form-data')
    @ApiResponse({ 
        status: 201, 
        description: 'Images uploaded successfully', 
        type: UploadImagesResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid images or image validation failed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                images: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]): Promise<UploadImagesResponseDto> {
        return this.uploadService.uploadImages(files);
    }

    @Delete(':filename')
    @ApiOperation({ 
        summary: 'Delete file by filename (Admin only)',
        description: 'Delete a file from AWS S3 and database using its filename.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'File deleted successfully', 
        type: DeleteFileResponseDto 
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @ApiParam({ 
        name: 'filename', 
        type: String, 
        description: 'Filename to delete',
        example: 'uuid123_image.jpg'
    })
    async deleteFile(@Param('filename') filename: string): Promise<DeleteFileResponseDto> {
        return this.uploadService.deleteFile(filename);
    }

    @Delete('images')
    @ApiOperation({ 
        summary: 'Delete image by URL (Admin only)',
        description: 'Delete an image from AWS S3 and database using its full URL.'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Image deleted successfully', 
        type: DeleteImageResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid image URL' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    @ApiBody({ type: DeleteImageDto })
    async deleteImage(@Body() deleteImageDto: DeleteImageDto): Promise<DeleteImageResponseDto> {
        return this.uploadService.deleteImage(deleteImageDto.imageUrl);
    }
} 