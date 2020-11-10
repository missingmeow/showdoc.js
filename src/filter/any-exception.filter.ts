import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import logger from 'src/utils/logger.util';

@Catch()
export class AnyExceptionFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse();
    const req = http.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const data =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message: 'Unknown Error', error: 'Internal Server Error' };

    if (!(exception instanceof HttpException)) {
      logger.error(exception.toString());
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
