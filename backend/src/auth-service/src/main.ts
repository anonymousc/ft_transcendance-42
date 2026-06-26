import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Basic CSRF protection for cookie-based auth (double-submit token).
  // Requires clients to send X-CSRF-Token header matching csrf_token cookie.
  app.use((req: Request, res: Response, next: NextFunction) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();

    const path = req.path || '';
    if (path === '/auth/signup' || path === '/auth/signin' || path.startsWith('/auth/login')) {
      return next();
    }

    const csrfCookie = req.cookies?.csrf_token as string | undefined;
    const csrfHeader = (req.header('x-csrf-token') || req.header('X-CSRF-Token')) as string | undefined;

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ ok: false, error: { code: 'CSRF', message: 'CSRF token missing or invalid' } });
    }
    return next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow one or more comma-separated origins via FRONTEND_URL, e.g.
  // "https://rihla.tech,https://137.184.159.183". Requests with no Origin
  // (same-origin, curl, health checks) are always allowed.
  const allowedOrigins = (process.env.FRONTEND_URL || 'https://rihla.tech')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  const port = process.env.AUTH_PORT || 3001;
  await app.listen(port);
  console.log(`Auth service running on port ${port}`);
}
bootstrap();
