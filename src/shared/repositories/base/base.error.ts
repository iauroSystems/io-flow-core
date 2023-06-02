import { HttpException } from '@nestjs/common';

export class BaseError extends HttpException {

  constructor(status: number, message: string) {
    super(message, status);
  }
}