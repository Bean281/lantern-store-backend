import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins in development. For production, specify your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Lantern Store E-commerce API')
    .setDescription(`
      Complete E-commerce REST API with authentication, product management, orders, and more.
      
      ## Authentication
      This API uses JWT Bearer tokens for authentication. To access protected endpoints:
      1. Register or login to get a token
      2. Use the 'Authorize' button below to add your token
      3. Format: Bearer <your-token>
      
      ## Base URL
      All endpoints are prefixed with \`/api\`
    `)
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints - register, login, logout, user info')
    .addTag('users', 'User management and profile operations')
    .addTag('products', 'Product catalog and management')
    .addTag('orders', 'Order processing and management')
    .addTag('categories', 'Product categories')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        name: 'Authorization',
        in: 'header',
      }
      // Removed the reference name to match default @ApiBearerAuth() decorators
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Setup Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Keep authorization after page refresh
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Lantern Store API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      /* Hide default topbar */
      .swagger-ui .topbar { display: none }
      
      /* Body and main background */
      body {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .swagger-ui {
        background: transparent;
      }
      
      /* Main wrapper styling */
      .swagger-ui .wrapper {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        margin: 20px;
        padding: 30px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        min-height: calc(100vh - 40px);
      }
      
      /* Header styling */
      .swagger-ui .info {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 30px;
        border-radius: 12px;
        margin-bottom: 30px;
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
      }
      
      .swagger-ui .info .title {
        color: white !important;
        font-size: 2.5rem;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        margin-bottom: 10px;
      }
      
      .swagger-ui .info .description {
        color: rgba(255, 255, 255, 0.9) !important;
        font-size: 1.1rem;
        line-height: 1.6;
      }
      
      /* Operations styling */
      .swagger-ui .opblock {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
      }
      
      .swagger-ui .opblock:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      /* Method badges */
      .swagger-ui .opblock.opblock-get .opblock-summary-method {
        background: linear-gradient(135deg, #10b981, #059669);
      }
      
      .swagger-ui .opblock.opblock-post .opblock-summary-method {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      }
      
      .swagger-ui .opblock.opblock-put .opblock-summary-method {
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }
      
      .swagger-ui .opblock.opblock-delete .opblock-summary-method {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }
      
      /* Tag sections */
      .swagger-ui .opblock-tag {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        border: none;
        border-radius: 8px;
        padding: 15px 20px;
        margin-bottom: 20px;
        font-weight: 600;
        color: #1e293b;
        font-size: 1.2rem;
      }
      
      /* Authorization section */
      .swagger-ui .auth-wrapper {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px solid #f59e0b;
      }
      
      /* Buttons */
      .swagger-ui .btn {
        border-radius: 6px;
        padding: 8px 16px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .swagger-ui .btn.authorize {
        background: linear-gradient(135deg, #10b981, #059669);
        border: none;
        color: white;
      }
      
      .swagger-ui .btn.authorize:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }
      
      .swagger-ui .btn.execute {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border: none;
        color: white;
      }
      
      .swagger-ui .btn.execute:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }
      
      /* Response section */
      .swagger-ui .responses-wrapper {
        background: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        margin-top: 15px;
      }
      
      /* Schema section */
      .swagger-ui .model-box {
        background: #f1f5f9;
        border-radius: 8px;
        border: 1px solid #cbd5e1;
      }
      
      /* Scrollbar styling */
      .swagger-ui ::-webkit-scrollbar {
        width: 8px;
      }
      
      .swagger-ui ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 4px;
      }
      
      .swagger-ui ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #1d4ed8, #1e40af);
      }
      
      /* Loading animation */
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: calc(200px + 100%) 0; }
      }
      
      .swagger-ui .loading {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
    `,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that don't have decorators
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion
      },
    })
  );

  // Simple health check endpoint for Render
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'Lantern Store Backend is running!',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  const port = process.env.PORT ?? 3333;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  console.log(`📚 Swagger documentation: http://0.0.0.0:${port}/api`);
}
bootstrap();
