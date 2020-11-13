import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
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
  // 解析 cookie
  app.use(cookieParser());

  // 添加 OpenApi
  const options = new DocumentBuilder()
    .setTitle('Showdoc.js API')
    .setDescription('本系统的 API 接口直接由原网页调试而来，参考原服务器数据的返回格式，并未做其他额外的修改。')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // 监听启动服务器
  await app.listen(3000);
}
bootstrap();
