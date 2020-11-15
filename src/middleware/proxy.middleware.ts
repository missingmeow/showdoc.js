import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientRequest } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import logger from 'src/utils/logger.util';
import { URLSearchParams } from 'url';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    proxyTimeout: 10000,
    pathRewrite: function (path: string, req: Request): string {
      return req.query['s'] as string;
    },
    logProvider: function () {
      return logger;
    },
    onError: function (err: Error, req: Request, res: Response) {
      logger.error(err.stack);
    },
    onProxyReq: function (proxyReq: ClientRequest, req: Request, res: Response) {
      if (!req.body || !Object.keys(req.body).length) {
        return;
      }

      const writeBody = (bodyData: string) => {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      };

      const contentType = proxyReq.getHeader('Content-Type') as string;
      if (contentType.indexOf('application/json') !== -1) {
        writeBody(JSON.stringify(req.body));
      } else if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
        writeBody(new URLSearchParams(req.body).toString());
      } else {
        logger.error('proxy do not send body when the content-type is' + contentType);
      }
    },
  });

  use(req: any, res: any, next: () => void) {
    this.proxy(req, res, next);
  }
}
