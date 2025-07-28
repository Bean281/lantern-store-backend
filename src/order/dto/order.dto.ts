import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  ValidateNested,
  Min,
  IsPhoneNumber,
  ArrayNotEmpty
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({ 
    description: 'Product ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @IsString()
  productId: string;

  @ApiProperty({ 
    description: 'Quantity of the product',
    example: 2,
    minimum: 1 
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Price per unit at time of order',
    example: 1999.99,
    minimum: 0 
  })
  @IsNumber()
  @Min(0)
  price: number;
}

export class CustomerInfoDto {
  @ApiProperty({ 
    description: 'Customer full name',
    example: 'John Doe' 
  })
  @IsString()
  fullName: string;

  @ApiProperty({ 
    description: 'Customer phone number',
    example: '+1234567890' 
  })
  @IsString()
  phone: string;

  @ApiProperty({ 
    description: 'Customer delivery address',
    example: '123 Main St, City, State 12345' 
  })
  @IsString()
  address: string;

  @ApiProperty({ 
    description: 'Additional notes for the order',
    example: 'Please deliver after 6 PM',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'Array of order items',
    type: [OrderItemDto] 
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ 
    description: 'Customer information',
    type: CustomerInfoDto 
  })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customerInfo: CustomerInfoDto;

  @ApiProperty({ 
    description: 'Total order amount',
    example: 3999.98,
    minimum: 0 
  })
  @IsNumber()
  @Min(0)
  total: number;
}

export class OrderItemResponseDto {
  @ApiProperty({ description: 'Order item ID' })
  id: string;

  @ApiProperty({ description: 'Product ID' })
  productId: string;

  @ApiProperty({ description: 'Product name at time of order' })
  name: string;

  @ApiProperty({ description: 'Price per unit at time of order' })
  price: number;

  @ApiProperty({ description: 'Quantity ordered' })
  quantity: number;

  @ApiProperty({ description: 'Product image URL' })
  image: string;
}

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({ description: 'Customer phone' })
  phone: string;

  @ApiProperty({ description: 'Delivery address' })
  address: string;

  @ApiProperty({ description: 'Order notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'Total order amount' })
  total: number;

  @ApiProperty({ 
    description: 'Order status',
    enum: ['NEW', 'NEGOTIATING', 'SHIPPING', 'COMPLETED'] 
  })
  status: string;

  @ApiProperty({ description: 'Order creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Order last update date' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Order items',
    type: [OrderItemResponseDto] 
  })
  items: OrderItemResponseDto[];
}

export class CreateOrderResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Created order', type: OrderResponseDto })
  order: OrderResponseDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class GetOrdersByPhoneResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ 
    description: 'Orders found for the phone number',
    type: [OrderResponseDto] 
  })
  orders: OrderResponseDto[];

  @ApiProperty({ description: 'Total number of orders found' })
  total: number;

  @ApiProperty({ description: 'Success message' })
  message: string;
}

export class GetOrdersByPhoneQueryDto {
  @ApiProperty({ 
    description: 'Customer phone number to search orders',
    example: '+1234567890' 
  })
  @IsString()
  phone: string;
}

export class UpdateOrderInfoDto {
  @ApiProperty({ 
    description: 'Customer full name',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    description: 'Customer phone number',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    description: 'Customer delivery address',
    example: '123 Main St, City, State 12345',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'Additional notes for the order',
    example: 'Please deliver after 6 PM',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderInfoResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Updated order', type: OrderResponseDto })
  order: OrderResponseDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
} 