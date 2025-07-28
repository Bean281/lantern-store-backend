import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
  UpdateInventoryResponseDto,
  OrderStatus,
  OrderAnalyticsDto,
  ProductAnalyticsDto,
  InventoryItemDto
} from './dto';
import { OrderResponseDto } from '../order/dto/order.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Order Management
  async getAllOrders(
    status?: string,
    page = 1,
    limit = 10,
    search?: string
  ): Promise<GetAllOrdersResponseDto> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { id: search }
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: true
            }
          },
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.order.count({ where })
    ]);

    const formattedOrders: OrderResponseDto[] = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      notes: order.notes || undefined,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    }));

    return {
      orders: formattedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async updateOrderStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<UpdateOrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        customerName: updatedOrder.customerName,
        phone: updatedOrder.phone,
        address: updatedOrder.address,
        notes: updatedOrder.notes || undefined,
        total: updatedOrder.total,
        status: updatedOrder.status,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        items: updatedOrder.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      }
    };
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<UpdateOrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        ...(updateOrderDto.customerName && { customerName: updateOrderDto.customerName }),
        ...(updateOrderDto.phone && { phone: updateOrderDto.phone }),
        ...(updateOrderDto.address && { address: updateOrderDto.address }),
        ...(updateOrderDto.notes !== undefined && { notes: updateOrderDto.notes }),
        ...(updateOrderDto.status && { status: updateOrderDto.status })
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    return {
      success: true,
      order: {
        id: updatedOrder.id,
        customerName: updatedOrder.customerName,
        phone: updatedOrder.phone,
        address: updatedOrder.address,
        notes: updatedOrder.notes || undefined,
        total: updatedOrder.total,
        status: updatedOrder.status,
        createdAt: updatedOrder.createdAt,
        updatedAt: updatedOrder.updatedAt,
        items: updatedOrder.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))
      }
    };
  }

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      monthlyRevenue,
      monthlyOrders,
      monthlyNewUsers,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      // Total revenue
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'NEW' } }
      }),
      // Total orders
      this.prisma.order.count(),
      // Total products
      this.prisma.product.count(),
      // Total users
      this.prisma.user.count(),
      // Monthly revenue
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: 'NEW' }
        }
      }),
      // Monthly orders
      this.prisma.order.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      // Monthly new users
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth } }
      }),
      // Low stock products (assuming threshold of 10)
      this.prisma.product.count({
        where: {
          stockCount: { lte: 10, gt: 0 },
          inStock: true
        }
      }),
      // Out of stock products
      this.prisma.product.count({
        where: {
          OR: [
            { stockCount: 0 },
            { inStock: false }
          ]
        }
      })
    ]);

    const averageOrderValue = totalOrders > 0 
      ? (totalRevenue._sum.total || 0) / totalOrders 
      : 0;

    return {
      totalRevenue: totalRevenue._sum.total || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      monthlyRevenue: monthlyRevenue._sum.total || 0,
      monthlyOrders,
      monthlyNewUsers,
      averageOrderValue,
      lowStockProducts,
      outOfStockProducts
    };
  }

  async getOrderAnalytics(period?: string): Promise<OrderAnalyticsResponseDto> {
    const now = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = 'month';
        break;
      case 'month':
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        groupBy = 'day';
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        total: true,
        createdAt: true,
        status: true
      }
    });

    const analyticsMap = new Map<string, { orders: number; revenue: number }>();

    orders.forEach(order => {
      let dateKey: string;
      if (groupBy === 'day') {
        dateKey = order.createdAt.toISOString().split('T')[0];
      } else {
        dateKey = `${order.createdAt.getFullYear()}-${(order.createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
      }

      if (!analyticsMap.has(dateKey)) {
        analyticsMap.set(dateKey, { orders: 0, revenue: 0 });
      }

      const data = analyticsMap.get(dateKey)!;
      data.orders += 1;
      if (order.status !== 'NEW') {
        data.revenue += order.total;
      }
    });

    const data: OrderAnalyticsDto[] = Array.from(analyticsMap.entries())
      .map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

    return {
      data,
      totalRevenue,
      totalOrders,
      averageDailyRevenue
    };
  }

  async getProductAnalytics(): Promise<ProductAnalyticsResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get top selling products
    const topSellingProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _avg: { price: true },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    const productIds = topSellingProducts.map(p => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        _count: {
          select: {
            cartItems: true
          }
        }
      }
    });

    const topSellingData: ProductAnalyticsDto[] = topSellingProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        totalSold: item._sum.quantity || 0,
        totalRevenue: (item._sum.quantity || 0) * (item._avg.price || 0),
        rating: product?.rating || 0,
        reviewCount: product?.reviewCount || 0,
        stockCount: product?.stockCount || 0,
        cartAdds: product?._count.cartItems || 0
      };
    });

    // Get low stock products
    const lowStockProductsData = await this.prisma.product.findMany({
      where: {
        stockCount: { lte: 10, gt: 0 },
        inStock: true
      },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      }
    });

    const lowStockData: ProductAnalyticsDto[] = lowStockProductsData.map(product => ({
      id: product.id,
      name: product.name,
      totalSold: product._count.orderItems,
      totalRevenue: product._count.orderItems * product.price,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stockCount: product.stockCount,
      cartAdds: product._count.cartItems
    }));

    // Get out of stock products
    const outOfStockProductsData = await this.prisma.product.findMany({
      where: {
        OR: [
          { stockCount: 0 },
          { inStock: false }
        ]
      },
      include: {
        _count: {
          select: {
            cartItems: true,
            orderItems: true
          }
        }
      }
    });

    const outOfStockData: ProductAnalyticsDto[] = outOfStockProductsData.map(product => ({
      id: product.id,
      name: product.name,
      totalSold: product._count.orderItems,
      totalRevenue: product._count.orderItems * product.price,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stockCount: product.stockCount,
      cartAdds: product._count.cartItems
    }));

    // Total products sold this month
    const monthlyProductsSold = await this.prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          createdAt: { gte: startOfMonth }
        }
      }
    });

    return {
      topSellingProducts: topSellingData,
      lowStockProducts: lowStockData,
      outOfStockProducts: outOfStockData,
      totalProductsSold: monthlyProductsSold._sum.quantity || 0
    };
  }

  // Inventory Management
  async getInventory(): Promise<InventoryResponseDto> {
    const products = await this.prisma.product.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    const inventory: InventoryItemDto[] = products.map(product => {
      const lowStockThreshold = 10; // Could be made configurable per product
      return {
        id: product.id,
        name: product.name,
        stockCount: product.stockCount,
        inStock: product.inStock,
        category: product.category,
        price: product.price,
        updatedAt: product.updatedAt,
        lowStockThreshold,
        isLowStock: product.stockCount <= lowStockThreshold && product.stockCount > 0
      };
    });

    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.inStock && p.stockCount > 0).length;
    const outOfStockProducts = products.filter(p => !p.inStock || p.stockCount === 0).length;
    const lowStockProducts = products.filter(p => p.stockCount <= 10 && p.stockCount > 0).length;

    return {
      inventory,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts
    };
  }

  async updateInventory(productId: string, updateInventoryDto: UpdateInventoryDto): Promise<UpdateInventoryResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        stockCount: updateInventoryDto.stockCount,
        inStock: updateInventoryDto.stockCount > 0
      }
    });

    return {
      success: true,
      message: 'Inventory updated successfully',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        stockCount: updatedProduct.stockCount,
        inStock: updatedProduct.inStock
      }
    };
  }
} 