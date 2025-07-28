# Admin API Documentation

The Admin API provides comprehensive management capabilities for administrators to oversee orders, analyze business metrics, and manage inventory.

## Authentication

All admin endpoints require:
- **JWT Authentication** (`JwtGuard`)
- **Admin Authorization** (`AdminGuard`) - User must have `isAdmin: true`
- **Bearer Token** in the Authorization header

## Base URL

All admin endpoints are prefixed with `/api/admin`

## Order Management

### Get All Orders
```
GET /api/admin/orders
```

**Query Parameters:**
- `status` (optional): Filter by order status (`NEW`, `NEGOTIATING`, `SHIPPING`, `COMPLETED`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in customer name, phone, address, or order ID

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "customerName": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St",
      "notes": "Deliver after 6 PM",
      "total": 1999.99,
      "status": "NEW",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "item_id",
          "productId": "product_id",
          "name": "Product Name",
          "price": 999.99,
          "quantity": 2,
          "image": "image_url"
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### Update Order Status
```
PUT /api/admin/orders/:id/status
```

**Body:**
```json
{
  "status": "SHIPPING"
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* Order object */ }
}
```

### Update Order Details
```
PUT /api/admin/orders/:id
```

**Body:**
```json
{
  "customerName": "John Doe Updated",
  "phone": "+1234567891",
  "address": "456 New St",
  "notes": "Updated notes",
  "status": "SHIPPING"
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* Updated order object */ }
}
```

## Analytics

### Analytics Overview
```
GET /api/admin/analytics/overview
```

**Response:**
```json
{
  "totalRevenue": 150000.00,
  "totalOrders": 1250,
  "totalProducts": 500,
  "totalUsers": 2000,
  "monthlyRevenue": 12000.00,
  "monthlyOrders": 95,
  "monthlyNewUsers": 150,
  "averageOrderValue": 120.00,
  "lowStockProducts": 15,
  "outOfStockProducts": 5
}
```

### Order Analytics
```
GET /api/admin/analytics/orders?period=month
```

**Query Parameters:**
- `period` (optional): `week`, `month`, or `year` (default: `month`)

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "orders": 25,
      "revenue": 3000.00
    }
  ],
  "totalRevenue": 15000.00,
  "totalOrders": 200,
  "averageDailyRevenue": 500.00
}
```

### Product Analytics
```
GET /api/admin/analytics/products
```

**Response:**
```json
{
  "topSellingProducts": [
    {
      "id": "product_id",
      "name": "Product Name",
      "totalSold": 150,
      "totalRevenue": 15000.00,
      "rating": 4.5,
      "reviewCount": 45,
      "stockCount": 20,
      "cartAdds": 300
    }
  ],
  "lowStockProducts": [ /* Array of products with low stock */ ],
  "outOfStockProducts": [ /* Array of out of stock products */ ],
  "totalProductsSold": 5000
}
```

## Inventory Management

### Get Inventory Overview
```
GET /api/admin/inventory
```

**Response:**
```json
{
  "inventory": [
    {
      "id": "product_id",
      "name": "Product Name",
      "stockCount": 45,
      "inStock": true,
      "category": "Electronics",
      "price": 999.99,
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "lowStockThreshold": 10,
      "isLowStock": false
    }
  ],
  "totalProducts": 500,
  "inStockProducts": 475,
  "outOfStockProducts": 5,
  "lowStockProducts": 20
}
```

### Update Product Inventory
```
PUT /api/admin/inventory/:productId
```

**Body:**
```json
{
  "stockCount": 100,
  "lowStockThreshold": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inventory updated successfully",
  "product": {
    "id": "product_id",
    "name": "Product Name",
    "stockCount": 100,
    "inStock": true
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Order not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["status must be a valid enum value"],
  "error": "Bad Request"
}
```

## Business Logic

### Order Status Flow
1. `NEW` - Initial order status
2. `NEGOTIATING` - Admin is discussing details with customer
3. `SHIPPING` - Order is being shipped
4. `COMPLETED` - Order has been delivered

### Stock Management
- Products with `stockCount <= 10` are considered low stock
- Products with `stockCount = 0` or `inStock = false` are out of stock
- Updating inventory automatically sets `inStock` based on `stockCount`

### Analytics Calculations
- **Revenue**: Only includes orders with status other than `NEW`
- **Average Order Value**: Total revenue divided by total orders
- **Period Analytics**: Groups data by day (week/month) or month (year)
- **Top Selling Products**: Based on total quantity sold across all orders

## Security Considerations

- All endpoints require JWT authentication
- Admin access is controlled by the `isAdmin` field in the user model
- Input validation is performed on all request bodies
- Pagination is enforced to prevent large data dumps
- Search functionality uses case-insensitive partial matching 