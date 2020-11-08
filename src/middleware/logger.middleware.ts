import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import logger from 'src/utils/logger.util';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    logger.info({
      ip: req.ip,
      method: req.method,
      path: req.path,
      message: `--> ${req.ip} ${req.method} ${req.originalUrl}`,
    });
    next();
  }
}
