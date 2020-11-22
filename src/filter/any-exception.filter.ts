import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import logger from 'src/utils/logger.util';
import { sendError } from 'src/utils/send.util';
import { QueryFailedError } from 'typeorm';
import { LoginException } from './custom.exception';

@Catch()
export class AnyExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse();
    const req = http.getRequest();

    if (exception instanceof LoginException) {
      res.status(200).send(sendError(exception.getStatus(), exception.message));
      return;
    }
    if (exception instanceof UnauthorizedException) {
      res.status(200).send(sendError(10102));
      return;
    }

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const data =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message: 'Unknown Error', error: 'Internal Server Error' };

    if (exception instanceof QueryFailedError) {
      logger.error(`${exception['query']} ${exception['parameters']}`);
    }
    if (exception instanceof Error && status != 404) {
      logger.error(exception.stack);
    }

    logger.error({
      ip: req.ip,
      method: req.method,
      path: req.path,
      data: data['message'],
      statusCode: status,
      message: `<-- ${req.ip} ${req.method} ${req.originalUrl} ${status}`,
    });

    res.status(status).send(data);
  }
}
