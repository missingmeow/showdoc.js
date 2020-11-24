import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { copyFileSync, existsSync } from 'fs';
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
  // 引入全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // 添加 OpenApi
  const options = new DocumentBuilder()
    .setTitle('Showdoc.js API Document')
    .setDescription(
      `
本系统的 API 接口直接由原网页调试而来，参考原服务器数据的返回格式，并未做其他额外的修改。\n
由于原来 PHP 服务器的特性，接口都是通过 /server/index.php?s= 传进来的，这里的实现是把这个请求转发到与 s 参数一致的路由上。\n
这样做是方便参数验证，也不需要把所有逻辑写在一个接口上。可惜的是由于原来接口的限制，导致不能很好的实现 RESTful Api 的效果。\n
所有接口请求默认返回 200，错误信息在返回数据中封装，不在 httpCode 上体现。
      `,
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // 监听启动服务器
  await app.listen(3000);
}

(() => {
  // 数据库文件初始化
  if (!existsSync('sqlite/showdoc.db.php')) {
    copyFileSync('sqlite/showdoc.db.default.php', 'sqlite/showdoc.db.php');
  }
  return;
})();

bootstrap();
