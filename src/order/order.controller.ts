import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtGuard, AdminGuard } from 'src/auth/guard';
import {
  CreateOrderDto,
  OrderResponseDto,
  CreateOrderResponseDto,
  GetOrdersByPhoneResponseDto,
  GetOrdersByPhoneQueryDto,
  UpdateOrderInfoDto,
  UpdateOrderInfoResponseDto,
} from './dto';

@ApiTags('orders')
@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create new order (No login required)',
    description: 'Create a new order without requiring user authentication. Guest orders are supported.'
  })
  @ApiBody({ 
    type: CreateOrderDto,
    description: 'Order creation data with items and customer information'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Order created successfully', 
    type: CreateOrderResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid order data, product not found, or insufficient stock' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get orders by phone number',
    description: 'Retrieve all orders associated with a phone number. No authentication required.'
  })
  @ApiQuery({ 
    name: 'phone', 
    description: 'Customer phone number to search orders',
    example: '+1234567890' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orders retrieved successfully', 
    type: GetOrdersByPhoneResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid phone number format' })
  async getOrdersByPhone(@Query('phone') phone: string): Promise<GetOrdersByPhoneResponseDto> {
    if (!phone) {
      throw new Error('Phone number is required');
    }
    return this.orderService.getOrdersByPhone(phone);
  }

  // Admin endpoints (for future use)
  @Get('all')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all orders (Admin only)',
    description: 'Retrieve all orders in the system. Requires admin privileges.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'All orders retrieved successfully',
    type: [OrderResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllOrders(): Promise<OrderResponseDto[]> {
    return this.orderService.getAllOrders();
  }

  @Get('stats')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get order statistics (Admin only)',
    description: 'Retrieve order statistics for admin dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalOrders: { type: 'number', example: 150 },
        newOrders: { type: 'number', example: 25 },
        processingOrders: { type: 'number', example: 50 },
        completedOrders: { type: 'number', example: 75 },
        totalRevenue: { type: 'number', example: 15750.50 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }

  @Put(':id/status')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update order status (Admin only)',
    description: 'Update the status of an existing order. Only admins can change order status.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['NEW', 'NEGOTIATING', 'SHIPPING', 'COMPLETED'],
          example: 'SHIPPING',
          description: 'New status for the order'
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order status updated successfully', 
    type: OrderResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid status' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: 'NEW' | 'NEGOTIATING' | 'SHIPPING' | 'COMPLETED'
  ): Promise<OrderResponseDto> {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update order information',
    description: 'Update customer information for an existing order. Customers can update their own orders by providing their phone number. Admins can update any order.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiQuery({ 
    name: 'phone', 
    description: 'Customer phone number (required for non-admin users to verify ownership)',
    example: '+1234567890',
    required: false
  })
  @ApiBody({ 
    type: UpdateOrderInfoDto,
    description: 'Order update data (only provide fields you want to update)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully', 
    type: UpdateOrderInfoResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data, completed order, or phone number mismatch' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderInfoDto,
    @Query('phone') phone?: string
  ): Promise<UpdateOrderInfoResponseDto> {
    return this.orderService.updateOrder(id, updateOrderDto, phone);
  }

  @Put(':id/admin')
  @UseGuards(JwtGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update order information (Admin only)',
    description: 'Update customer information for any order. Admin version without phone verification requirement.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Order ID',
    example: '507f1f77bcf86cd799439011' 
  })
  @ApiBody({ 
    type: UpdateOrderInfoDto,
    description: 'Order update data (only provide fields you want to update)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Order updated successfully', 
    type: UpdateOrderInfoResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data or completed order' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderAdmin(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderInfoDto
  ): Promise<UpdateOrderInfoResponseDto> {
    return this.orderService.updateOrder(id, updateOrderDto);
  }
} 