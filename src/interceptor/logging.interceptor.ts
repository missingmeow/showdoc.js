import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import logger from 'src/utils/logger.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.getArgByIndex(1).req;
    const now = Date.now();
    return next.handle().pipe(
      map((data) => {
        logger.info({
          ip: req.ip,
          method: req.method,
          path: req.path,
          data,
          statusCode: req.res.statusCode,
          message: `<-- ${req.ip} ${req.method} ${req.originalUrl} ${req.res.statusCode} ${Date.now() - now}ms`,
        });
        return data;
      }),
    );
  }
}
