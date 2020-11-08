import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AnyExceptionFilter } from './filter/any-exception.filter';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { LoggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // 静态资源目录
  app.useStaticAssets(join(__dirname, '../public'), { prefix: '/public' });
  app.useStaticAssets(join(__dirname, '../web'), { prefix: '/web' });
  // 全局中间件
  app.use(new LoggerMiddleware().use);
  // 全局拦截器
  app.useGlobalInterceptors(new LoggingInterceptor());
  // 全局过滤器
  app.useGlobalFilters(new AnyExceptionFilter());
  await app.listen(3000);
}
bootstrap();
