import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 静态资源目录
  app.useStaticAssets(join(__dirname, '../public'), { prefix: '/public' });
  app.useStaticAssets(join(__dirname, '../web'), { prefix: '/web' });
  // 全局中间件
  app.use(new LoggerMiddleware().use);

  await app.listen(3000);
}
bootstrap();
