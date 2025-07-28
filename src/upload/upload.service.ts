import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { s3Client, S3_BUCKET_NAME, generateS3Url } from 'src/config/s3.config';
import { 
    PutObjectCommand, 
    DeleteObjectCommand, 
    GetObjectCommand 
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { 
    UploadFilesResponseDto,
    UploadImagesResponseDto,
    DeleteFileResponseDto,
    DeleteImageResponseDto,
    UploadedFileResponseDto
} from './dto';

@Injectable()
export class UploadService {
    constructor(private prisma: PrismaService) {}

    async uploadFiles(files: Express.Multer.File[]): Promise<UploadFilesResponseDto> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const uploadedFiles: UploadedFileResponseDto[] = [];

        try {
            for (const file of files) {
                // Validate file
                this.validateFile(file);

                // Generate unique filename
                const fileName = `${uuidv4()}_${file.originalname}`;
                const key = `files/${fileName}`;

                // Upload to S3 without ACL (bucket uses bucket policy instead)
                const uploadCommand = new PutObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    // Removed ACL - bucket should use bucket policy for public access
                });

                await s3Client.send(uploadCommand);

                // Generate public URL using helper function
                const url = generateS3Url(key);

                // Save file info to database
                const savedFile = await this.prisma.uploadedFile.create({
                    data: {
                        filename: fileName,
                        url: url,
                        size: file.size,
                        mimetype: file.mimetype,
                    },
                });

                uploadedFiles.push(savedFile);
            }

            return {
                success: true,
                files: uploadedFiles,
                message: 'Files uploaded successfully',
            };
        } catch (error) {
            // Enhanced error handling for AWS S3 specific errors
            if (error.name === 'PermanentRedirect') {
                throw new BadRequestException(`AWS S3 Error: The bucket is located in a different region. Please check your AWS_REGION environment variable. Error: ${error.message}`);
            }
            if (error.name === 'NoSuchBucket') {
                throw new BadRequestException(`AWS S3 Error: The bucket '${S3_BUCKET_NAME}' does not exist or you don't have access to it.`);
            }
            if (error.name === 'InvalidAccessKeyId') {
                throw new BadRequestException('AWS S3 Error: Invalid AWS Access Key ID. Please check your AWS credentials.');
            }
            if (error.name === 'SignatureDoesNotMatch') {
                throw new BadRequestException('AWS S3 Error: Invalid AWS Secret Access Key. Please check your AWS credentials.');
            }
            if (error.message?.includes('does not allow ACLs')) {
                throw new BadRequestException('AWS S3 Error: Bucket ACLs are disabled. This has been fixed in the code. Please try again.');
            }
            
            console.error('S3 Upload Error:', error);
            throw new BadRequestException(`Failed to upload files: ${error.message}`);
        }
    }

    async uploadImages(files: Express.Multer.File[]): Promise<UploadImagesResponseDto> {
        if (!files || files.length === 0) {
            throw new BadRequestException('No images provided');
        }

        const imageUrls: string[] = [];

        try {
            for (const file of files) {
                // Validate image file
                this.validateImageFile(file);

                // Generate unique filename
                const fileName = `${uuidv4()}_${file.originalname}`;
                const key = `images/${fileName}`;

                // Upload to S3 without ACL (bucket uses bucket policy instead)
                const uploadCommand = new PutObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    // Removed ACL - bucket should use bucket policy for public access
                });

                await s3Client.send(uploadCommand);

                // Generate public URL using helper function
                const url = generateS3Url(key);
                imageUrls.push(url);

                // Save image info to database
                await this.prisma.uploadedFile.create({
                    data: {
                        filename: fileName,
                        url: url,
                        size: file.size,
                        mimetype: file.mimetype,
                    },
                });
            }

            return {
                success: true,
                imageUrls,
                message: 'Images uploaded successfully',
            };
        } catch (error) {
            // Enhanced error handling for AWS S3 specific errors
            if (error.name === 'PermanentRedirect') {
                throw new BadRequestException(`AWS S3 Error: The bucket is located in a different region. Please check your AWS_REGION environment variable. Error: ${error.message}`);
            }
            if (error.name === 'NoSuchBucket') {
                throw new BadRequestException(`AWS S3 Error: The bucket '${S3_BUCKET_NAME}' does not exist or you don't have access to it.`);
            }
            if (error.name === 'InvalidAccessKeyId') {
                throw new BadRequestException('AWS S3 Error: Invalid AWS Access Key ID. Please check your AWS credentials.');
            }
            if (error.name === 'SignatureDoesNotMatch') {
                throw new BadRequestException('AWS S3 Error: Invalid AWS Secret Access Key. Please check your AWS credentials.');
            }
            if (error.message?.includes('does not allow ACLs')) {
                throw new BadRequestException('AWS S3 Error: Bucket ACLs are disabled. This has been fixed in the code. Please try again.');
            }
            
            console.error('S3 Upload Error:', error);
            throw new BadRequestException(`Failed to upload images: ${error.message}`);
        }
    }

    async deleteFile(filename: string): Promise<DeleteFileResponseDto> {
        try {
            // Find file in database
            const file = await this.prisma.uploadedFile.findUnique({
                where: { filename },
            });

            if (!file) {
                throw new NotFoundException('File not found in database');
            }

            // Delete from S3
            const key = `files/${filename}`;
            const deleteCommand = new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(deleteCommand);

            // Delete from database
            await this.prisma.uploadedFile.delete({
                where: { filename },
            });

            return {
                success: true,
                message: 'File deleted successfully',
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to delete file: ${error.message}`);
        }
    }

    async deleteImage(imageUrl: string): Promise<DeleteImageResponseDto> {
        try {
            // Extract key from S3 URL
            const urlParts = imageUrl.split('/');
            const bucketIndex = urlParts.findIndex(part => part.includes('.s3.'));
            if (bucketIndex === -1) {
                throw new BadRequestException('Invalid S3 URL format');
            }

            // Get the key (path after bucket URL)
            const key = urlParts.slice(bucketIndex + 1).join('/');

            // Delete from S3
            const deleteCommand = new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
            });

            await s3Client.send(deleteCommand);

            // Extract filename for database deletion
            const filename = key.split('/').pop();
            if (filename) {
                // Try to delete from database (optional, in case it exists)
                await this.prisma.uploadedFile.deleteMany({
                    where: { filename },
                });
            }

            return {
                success: true,
                message: 'Image deleted successfully',
            };
        } catch (error) {
            throw new BadRequestException(`Failed to delete image: ${error.message}`);
        }
    }

    private validateFile(file: Express.Multer.File): void {
        // Maximum file size: 10MB
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File size must be less than 10MB');
        }

        // Allowed file types
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('File type not allowed');
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
} 