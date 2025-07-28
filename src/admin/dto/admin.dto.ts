import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  Min, 
  IsInt 
} from 'class-validator';
import { OrderResponseDto } from '../../order/dto/order.dto';

export enum OrderStatus {
  NEW = 'NEW',
  NEGOTIATING = 'NEGOTIATING',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED'
}

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.SHIPPING
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderDto {
  @ApiProperty({ 
    description: 'Customer name',
    required: false,
    example: 'John Doe' 
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ 
    description: 'Customer phone',
    required: false,
    example: '+1234567890' 
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    description: 'Delivery address',
    required: false,
    example: '123 Main St, City, State 12345' 
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    description: 'Order notes',
    required: false,
    example: 'Deliver after 6 PM' 
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Order status',
    enum: OrderStatus,
    required: false,
    example: OrderStatus.SHIPPING
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class GetAllOrdersResponseDto {
  @ApiProperty({ 
    description: 'Array of orders',
    type: [OrderResponseDto] 
  })
  orders: OrderResponseDto[];

  @ApiProperty({ description: 'Total number of orders' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;
}

export class UpdateOrderResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Updated order', type: OrderResponseDto })
  order: OrderResponseDto;
}

export class AnalyticsOverviewDto {
  @ApiProperty({ description: 'Total revenue' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total orders count' })
  totalOrders: number;

  @ApiProperty({ description: 'Total products count' })
  totalProducts: number;

  @ApiProperty({ description: 'Total users count' })
  totalUsers: number;

  @ApiProperty({ description: 'Revenue this month' })
  monthlyRevenue: number;

  @ApiProperty({ description: 'Orders this month' })
  monthlyOrders: number;

  @ApiProperty({ description: 'New users this month' })
  monthlyNewUsers: number;

  @ApiProperty({ description: 'Average order value' })
  averageOrderValue: number;

  @ApiProperty({ description: 'Low stock products count' })
  lowStockProducts: number;

  @ApiProperty({ description: 'Out of stock products count' })
  outOfStockProducts: number;
}

export class OrderAnalyticsDto {
  @ApiProperty({ description: 'Date label' })
  date: string;

  @ApiProperty({ description: 'Orders count for the date' })
  orders: number;

  @ApiProperty({ description: 'Revenue for the date' })
  revenue: number;
}

export class OrderAnalyticsResponseDto {
  @ApiProperty({ 
    description: 'Array of order analytics data',
    type: [OrderAnalyticsDto] 
  })
  data: OrderAnalyticsDto[];

  @ApiProperty({ description: 'Total revenue for the period' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total orders for the period' })
  totalOrders: number;

  @ApiProperty({ description: 'Average daily revenue' })
  averageDailyRevenue: number;
}

export class ProductAnalyticsDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Total quantity sold' })
  totalSold: number;

  @ApiProperty({ description: 'Total revenue from product' })
  totalRevenue: number;

  @ApiProperty({ description: 'Average rating' })
  rating: number;

  @ApiProperty({ description: 'Number of reviews' })
  reviewCount: number;

  @ApiProperty({ description: 'Current stock count' })
  stockCount: number;

  @ApiProperty({ description: 'Number of times added to cart' })
  cartAdds: number;
}

export class ProductAnalyticsResponseDto {
  @ApiProperty({ 
    description: 'Top selling products',
    type: [ProductAnalyticsDto] 
  })
  topSellingProducts: ProductAnalyticsDto[];

  @ApiProperty({ 
    description: 'Low stock products',
    type: [ProductAnalyticsDto] 
  })
  lowStockProducts: ProductAnalyticsDto[];

  @ApiProperty({ 
    description: 'Out of stock products',
    type: [ProductAnalyticsDto] 
  })
  outOfStockProducts: ProductAnalyticsDto[];

  @ApiProperty({ description: 'Total products sold this month' })
  totalProductsSold: number;
}

export class InventoryItemDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiProperty({ description: 'Current stock count' })
  stockCount: number;

  @ApiProperty({ description: 'In stock status' })
  inStock: boolean;

  @ApiProperty({ description: 'Product category' })
  category: string;

  @ApiProperty({ description: 'Product price' })
  price: number;

  @ApiProperty({ description: 'Last updated' })
  updatedAt: Date;

  @ApiProperty({ description: 'Low stock threshold (default: 10)' })
  lowStockThreshold: number;

  @ApiProperty({ description: 'Is low stock' })
  isLowStock: boolean;
}

export class InventoryResponseDto {
  @ApiProperty({ 
    description: 'Array of inventory items',
    type: [InventoryItemDto] 
  })
  inventory: InventoryItemDto[];

  @ApiProperty({ description: 'Total products' })
  totalProducts: number;

  @ApiProperty({ description: 'In stock products' })
  inStockProducts: number;

  @ApiProperty({ description: 'Out of stock products' })
  outOfStockProducts: number;

  @ApiProperty({ description: 'Low stock products' })
  lowStockProducts: number;
}

export class UpdateInventoryDto {
  @ApiProperty({ 
    description: 'New stock count',
    example: 50,
    minimum: 0 
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockCount: number;

  @ApiProperty({ 
    description: 'Low stock threshold',
    required: false,
    example: 10,
    minimum: 0 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}

export class UpdateInventoryResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Updated product inventory info' })
  product: {
    id: string;
    name: string;
    stockCount: number;
    inStock: boolean;
  };
} 