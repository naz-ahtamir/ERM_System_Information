import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Hapus batasan ukuran body (untuk upload file besar) ──
  app.use(require('express').json({ limit: '2gb' }));
  app.use(require('express').urlencoded({ limit: '2gb', extended: true }));

  // ── Global Validation Pipe ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── CORS — origin dari env var ──
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
  });

  // ── Swagger — selalu aktif ──
      const config = new DocumentBuilder()
      .setTitle('SMK3 Enterprise API')
      .setDescription('API untuk sistem manajemen K3 PT. QMB New Energy Materials')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('📚 Swagger docs: http://localhost:3001/api/docs');
  

  // ── Start Server ──
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
