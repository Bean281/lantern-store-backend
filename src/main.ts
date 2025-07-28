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
    .addServer('http://localhost:3333', 'Development server')
    // .addServer('https://api.lanternstore.com', 'Production server')
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
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6; }
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

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
