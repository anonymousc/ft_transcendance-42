import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthAppModule } from './auth-app.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthAppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.AUTH_PORT || 3001;
  await app.listen(port);
  console.log(`Auth microservice running on port ${port}`);
}
bootstrap();
