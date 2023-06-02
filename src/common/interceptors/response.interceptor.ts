import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    const { ip, method, originalUrl, body } = request;
    const userAgent = request.get('user-agent') || '';
    const tenantId = request.get('x-tenant-id') || '';

    response.on('close', () => {
      const { statusCode } = response;
      if (statusCode < 400) {
        const contentLength = response.get('content-length');
        this.logger.log(`[${tenantId}]: ${method} ${originalUrl} --> ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
      }
    });
    // if (response.status === 201)
    return next.handle()
    // .pipe(
    //   map(data => {
    //     return response.status(data.statusCode !== undefined ? data.statusCode : HttpStatus.OK).json(data);
    //   }),
    // );
  }
}