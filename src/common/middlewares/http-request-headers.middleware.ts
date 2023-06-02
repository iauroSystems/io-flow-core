/* eslint-disable @typescript-eslint/dot-notation */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import jwt_decode from 'jwt-decode'
@Injectable()
export class HttpRequestHeadersMiddleware implements NestMiddleware {
  async use(request: Request, _response: Response, next: NextFunction) {
    let tenantId = request.headers['x-tenant-id'] || request.headers['X-TENANT-ID'];

    if (request.headers['authorization']) {
      const token = request.headers['authorization'].split(' ')[1]
      const decodedToken = jwt_decode(token);
      tenantId = decodedToken['tenantId'] || tenantId;
      request.headers['x-tenant-id'] = tenantId;
      request.headers['user-id'] = decodedToken['userId'] || request.headers['user-id'];
    }
    return next();
  }
}