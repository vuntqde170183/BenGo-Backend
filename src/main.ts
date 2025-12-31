import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './exception-filter/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './utils/transform.interceptor';

async function bootstrap() {
  // Tắt các LOG mặc định của NestJS, chỉ hiển thị error và warning
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Add global response transformer
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors();
  
  const config = new DocumentBuilder()
    .setTitle('BenGo Delivery Service')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  // Hiển thị thông tin quan trọng
  console.log('\n========================================');
  console.log('🚀 BenGo Delivery Service');
  console.log('========================================');
  console.log(`✅ MongoDB: Đã kết nối thành công`);
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`📚 API Docs: http://localhost:${port}/docs`);
  console.log('========================================\n');
}
bootstrap();
