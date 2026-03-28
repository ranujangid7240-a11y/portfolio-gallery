import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Helmet header security
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to load cross-origin
  }));

  // Ensure uploads directory exists
  const uploadPath = join(__dirname, '..', 'uploads');
  if (!require('fs').existsSync(uploadPath)) {
    require('fs').mkdirSync(uploadPath);
  }

  await app.listen(3000);
}
bootstrap();
