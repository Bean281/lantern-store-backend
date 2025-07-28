import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { AdminGuard } from '../auth/guard/admin.guard';
import { AdminService } from './admin.service';
import {
  UpdateOrderStatusDto,
  UpdateOrderDto,
  GetAllOrdersResponseDto,
  UpdateOrderResponseDto,
  AnalyticsOverviewDto,
  OrderAnalyticsResponseDto,
  ProductAnalyticsResponseDto,
  InventoryResponseDto,
  UpdateInventoryDto,
  UpdateInventoryResponseDto
} from './dto';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Order Management
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by order status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Search in customer name, phone, address, or order ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Orders retrieved successfully',
    type: GetAllOrdersResponseDto 
  })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ): Promise<GetAllOrdersResponseDto> {
    return this.adminService.getAllOrders(status, +page, +limit, search);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Order status updated successfully',
    type: UpdateOrderResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto
  ): Promise<UpdateOrderResponseDto> {
    return this.adminService.updateOrderStatus(id, updateStatusDto);
  }

  @Put('orders/:id')
  @ApiOperation({ summary: 'Update order details' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Order updated successfully',
    type: UpdateOrderResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ): Promise<UpdateOrderResponseDto> {
    return this.adminService.updateOrder(id, updateOrderDto);
  }

  // Analytics
  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get analytics overview with key metrics' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Analytics overview retrieved successfully',
    type: AnalyticsOverviewDto 
  })
  async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
    return this.adminService.getAnalyticsOverview();
  }

  @Get('analytics/orders')
  @ApiOperation({ summary: 'Get order analytics data over time' })
  @ApiQuery({ 
    name: 'period', 
    required: false, 
    description: 'Time period for analytics',
    enum: ['week', 'month', 'year']
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Order analytics retrieved successfully',
    type: OrderAnalyticsResponseDto 
  })
  async getOrderAnalytics(
    @Query('period') period?: string
  ): Promise<OrderAnalyticsResponseDto> {
    return this.adminService.getOrderAnalytics(period);
  }

  @Get('analytics/products')
  @ApiOperation({ summary: 'Get product analytics including top sellers and stock status' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Product analytics retrieved successfully',
    type: ProductAnalyticsResponseDto 
  })
  async getProductAnalytics(): Promise<ProductAnalyticsResponseDto> {
    return this.adminService.getProductAnalytics();
  }

  // Inventory Management
  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory overview with stock levels' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Inventory data retrieved successfully',
    type: InventoryResponseDto 
  })
  async getInventory(): Promise<InventoryResponseDto> {
    return this.adminService.getInventory();
  }

  @Put('inventory/:productId')
  @ApiOperation({ summary: 'Update product inventory' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Inventory updated successfully',
    type: UpdateInventoryResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Product not found' })
  async updateInventory(
    @Param('productId') productId: string,
    @Body() updateInventoryDto: UpdateInventoryDto
  ): Promise<UpdateInventoryResponseDto> {
    return this.adminService.updateInventory(productId, updateInventoryDto);
  }
} 