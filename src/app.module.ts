import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './module/common/common.module';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { UserController } from './module/user/user.controller';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { ItemModule } from './module/item/item.module';
import { TeamModule } from './module/team/team.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './sqlite/showdoc.db.php',
      autoLoadEntities: true,
    }),
    CommonModule,
    AuthModule,
    UserModule,
    ItemModule,
    TeamModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('server/index.php');
  }
}
