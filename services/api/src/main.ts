import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? process.env.API_PORT ?? 3001;
  const apiPrefix = process.env.API_PREFIX ?? 'api';
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  app.setGlobalPrefix(apiPrefix);

  const corsOrigins = process.env.CORS_ORIGINS;
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',') : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (process.env.SWAGGER_ENABLED !== 'false') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ClearRing API')
      .setDescription(
        'ClearRing — Know who\'s calling before you answer.\n\n' +
        '**Dev OTP**: 123456 (any number in development mode)\n\n' +
        '**Admin**: +911234567890 | **Test User**: +919000000001',
      )
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
      .addTag('auth', 'Authentication — OTP-based phone login')
      .addTag('numbers', 'Phone number lookup and reporting')
      .addTag('business', 'Business verification and claims')
      .addTag('disputes', 'Number label disputes and corrections')
      .addTag('users', 'User profile management')
      .addTag('admin', 'Admin management endpoints')
      .addTag('analytics', 'Analytics and stats')
      .addTag('public', 'Public endpoints (waitlist, health)')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    logger.log(`Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
  }

  await app.listen(port);
  logger.log(`ClearRing API running: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${nodeEnv}`);
  logger.log(`Health: http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
