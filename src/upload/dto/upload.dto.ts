import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class UploadedFileResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    filename: string;

    @ApiProperty()
    url: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    mimetype: string;

    @ApiProperty()
    createdAt: Date;
}

export class UploadFilesResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ type: [UploadedFileResponseDto] })
    files: UploadedFileResponseDto[];

    @ApiProperty({ example: 'Files uploaded successfully' })
    message: string;
}

export class UploadImagesResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ 
        type: [String], 
        example: [
            'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/images%2Fimage1.jpg?alt=media',
            'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/images%2Fimage2.jpg?alt=media'
        ]
    })
    imageUrls: string[];

    @ApiProperty({ example: 'Images uploaded successfully' })
    message: string;
}

export class DeleteImageDto {
    @ApiProperty({ 
        example: 'https://firebasestorage.googleapis.com/v0/b/project.appspot.com/o/images%2Fimage.jpg?alt=media',
        description: 'Full Firebase storage URL of the image to delete'
    })
    @IsString()
    @IsNotEmpty()
    @IsUrl({}, { message: 'Please provide a valid image URL' })
    imageUrl: string;
}

export class DeleteFileResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'File deleted successfully' })
    message: string;
}

export class DeleteImageResponseDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Image deleted successfully' })
    message: string;
} 