import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateOrderDto,
  OrderResponseDto,
  CreateOrderResponseDto,
  GetOrdersByPhoneResponseDto,
} from './dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {
    try {
      // Validate order total matches items total
      await this.validateOrderTotal(createOrderDto);

      // Validate all products exist and are in stock
      await this.validateProducts(createOrderDto.items);

      // Get or create guest user for orders without login
      const guestUser = await this.getOrCreateGuestUser();

      // Fetch product details for order items
      const enrichedItems = await this.enrichOrderItems(createOrderDto.items);

      // Create order with items in a transaction
      const order = await this.prisma.$transaction(async (prisma) => {
        // Create the order
        const newOrder = await prisma.order.create({
          data: {
            userId: guestUser.id,
            customerName: createOrderDto.customerInfo.fullName,
            phone: createOrderDto.customerInfo.phone,
            address: createOrderDto.customerInfo.address,
            notes: createOrderDto.customerInfo.notes,
            total: createOrderDto.total,
            status: 'NEW',
          },
        });

        // Create order items
        const orderItems = await Promise.all(
          enrichedItems.map(item =>
            prisma.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
              },
            })
          )
        );

        // Return order with items
        return {
          ...newOrder,
          items: orderItems,
        };
      });

      // Format response
      const orderResponse: OrderResponseDto = {
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        notes: order.notes || undefined,
        total: order.total,
        status: order.status as any,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      return {
        success: true,
        order: orderResponse,
        message: 'Order created successfully',
      };
    } catch (error) {
      console.error('Create order error:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async getOrdersByPhone(phone: string): Promise<GetOrdersByPhoneResponseDto> {
    try {
      const orders = await this.prisma.order.findMany({
        where: {
          phone: {
            equals: phone,
            mode: 'insensitive',
          },
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (orders.length === 0) {
        return {
          success: true,
          orders: [],
          total: 0,
          message: 'No orders found for this phone number',
        };
      }

      // Format orders response
      const ordersResponse: OrderResponseDto[] = orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        notes: order.notes || undefined,
        total: order.total,
        status: order.status as any,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      }));

      return {
        success: true,
        orders: ordersResponse,
        total: orders.length,
        message: `Found ${orders.length} order(s) for phone number`,
      };
    } catch (error) {
      console.error('Get orders by phone error:', error);
      throw new BadRequestException(`Failed to get orders: ${error.message}`);
    }
  }

  // Admin methods (for future use)
  async getAllOrders(): Promise<OrderResponseDto[]> {
    try {
      const orders = await this.prisma.order.findMany({
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return orders.map(order => ({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        notes: order.notes || undefined,
        total: order.total,
        status: order.status as any,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      }));
    } catch (error) {
      console.error('Get all orders error:', error);
      throw new BadRequestException(`Failed to get orders: ${error.message}`);
    }
  }

  async updateOrderStatus(orderId: string, status: 'NEW' | 'NEGOTIATING' | 'SHIPPING' | 'COMPLETED'): Promise<OrderResponseDto> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true },
      });

      return {
        id: updatedOrder.id,
        customerName: updatedOrder.customerName,
        phone: updatedOrder.phone,
        address: updatedOrder.address,
        notes: updatedOrder.notes || undefined,
        total: updatedOrder.total,
        status: updatedOrder.status as any,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        items: updatedOrder.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Update order status error:', error);
      throw new BadRequestException(`Failed to update order status: ${error.message}`);
    }
  }

  // Private helper methods
  private async getOrCreateGuestUser() {
    const guestEmail = 'guest@lanternstore.com';
    
    let guestUser = await this.prisma.user.findUnique({
      where: { email: guestEmail },
    });

    if (!guestUser) {
      guestUser = await this.prisma.user.create({
        data: {
          email: guestEmail,
          name: 'Guest User',
          password: 'no-password-required', // Guest users don't need passwords
          isAdmin: false,
        },
      });
    }

    return guestUser;
  }

  private async validateOrderTotal(createOrderDto: CreateOrderDto): Promise<void> {
    const calculatedTotal = createOrderDto.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );

    // Allow small floating point differences (1 cent)
    const difference = Math.abs(calculatedTotal - createOrderDto.total);
    if (difference > 0.01) {
      throw new BadRequestException(
        `Order total mismatch. Expected: ${calculatedTotal.toFixed(2)}, Received: ${createOrderDto.total.toFixed(2)}`
      );
    }
  }

  private async validateProducts(items: Array<{ productId: string; quantity: number; price: number }>): Promise<void> {
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      if (!product.inStock) {
        throw new BadRequestException(`Product "${product.name}" is out of stock`);
      }

      if (product.stockCount > 0 && product.stockCount < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for product "${product.name}". Available: ${product.stockCount}, Requested: ${item.quantity}`
        );
      }

      // Validate price hasn't changed significantly (within 5% tolerance)
      const priceDifference = Math.abs(product.price - item.price) / product.price;
      if (priceDifference > 0.05) {
        throw new BadRequestException(
          `Price mismatch for product "${product.name}". Current price: ${product.price}, Order price: ${item.price}`
        );
      }
    }
  }

  private async enrichOrderItems(items: Array<{ productId: string; quantity: number; price: number }>) {
    const enrichedItems: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }> = [];

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      enrichedItems.push({
        productId: item.productId,
        name: product.name,
        price: item.price,
        quantity: item.quantity,
        image: product.images[0] || '', // Use first image or empty string
      });
    }

    return enrichedItems;
  }

  // Statistics method for admin dashboard
  async getOrderStats(): Promise<{
    totalOrders: number;
    newOrders: number;
    processingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    try {
      const [totalOrders, newOrders, processingOrders, completedOrders, revenueResult] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'NEW' } }),
        this.prisma.order.count({ 
          where: { 
            status: { 
              in: ['NEGOTIATING', 'SHIPPING'] 
            } 
          } 
        }),
        this.prisma.order.count({ where: { status: 'COMPLETED' } }),
        this.prisma.order.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { total: true },
        }),
      ]);

      return {
        totalOrders,
        newOrders,
        processingOrders,
        completedOrders,
        totalRevenue: Math.round((revenueResult._sum.total || 0) * 100) / 100,
      };
    } catch (error) {
      console.error('Get order stats error:', error);
      throw new BadRequestException(`Failed to get order statistics: ${error.message}`);
    }
  }
} 