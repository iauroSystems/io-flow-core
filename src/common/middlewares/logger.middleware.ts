import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const tenantId = request.get('x-tenant-id') || '';

    response.on('close', () => {
      console.log('&&&&&&&&&&&&&& ', originalUrl);
      const { statusCode } = response;
      if (statusCode < 400 && originalUrl !== '/v1/timer') {
        const contentLength = response.get('content-length');
        this.logger.log(`[${tenantId}]: ${method} ${originalUrl} --> ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
      }
    });

    next();
  }
}