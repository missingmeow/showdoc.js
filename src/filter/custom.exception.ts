import { HttpException } from '@nestjs/common';

export class LoginException extends HttpException {
  constructor(err: string, status: number) {
    super(err, status);
  }
}

export class NoAuthException extends HttpException {
  constructor(err: string, status: number) {
    super(err, status);
  }
}
