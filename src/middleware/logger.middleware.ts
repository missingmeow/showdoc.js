import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import logger from 'src/utils/logger';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    logger.info(`--> ${req.ip} ${req.method} ${req.originalUrl}`);
    next();
    logger.info(`<-- ${req.ip} ${req.method} ${req.originalUrl} \
${res.statusCode} ${JSON.stringify(req.body)}`);
  }
}
