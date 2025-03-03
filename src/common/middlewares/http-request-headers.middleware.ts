/* eslint-disable @typescript-eslint/dot-notation */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode'
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { JWTFields } from 'src/shared/dtos';
// import { GlobalScheduleProvider } from '../providers/global-schedule.provider';

@Injectable()
export class HttpRequestHeadersMiddleware implements NestMiddleware {

  constructor (
    private http: HttpConnector,
    // private globalVariableProvider: GlobalScheduleProvider
  ) { }

  async use(request: Request, _response: Response, next: NextFunction) {
    let tenantId = request.headers['x-tenant-id'] || request.headers['X-TENANT-ID'];
    if (!request.baseUrl.endsWith('/timer')) {
      // const requestData = {
      //   url: process.env.KEYCLOAK_URL,
      //   method: 'post',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   data: {
      //     'client_id': process.env.KEYCLOAK_CLIENT_ID,
      //     'username': process.env.KEYCLOAK_USERNAME,
      //     'password': process.env.KEYCLOAK_PASSWORD,
      //     'grant_type': process.env.KEYCLOAK_GRANT_TYPE
      //   }
      // };
      // const [err, data] = await this.http.call(requestData);
      // request.headers['admin-authorization'] = `Bearer ${data?.data?.access_token}`;


      if (request.headers['authorization']) {
        const token = request.headers['authorization'].split(' ')[1]
        const decodedToken: JWTFields = jwtDecode(token);
        if (decodedToken.tenantId !== process.env.DEFAULT_TENANT_ID) {
          tenantId = decodedToken.tenantId || tenantId;
        }
        request.headers['x-tenant-id'] = tenantId;
        request.headers['user-id'] = decodedToken.userId || request.headers['user-id'];
      }
    }
    const formatMemoryUsage = (data) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
    const memoryData = process.memoryUsage();
    const memoryUsage = {
      rss: `${formatMemoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
      heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
      heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
      external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };

    console.log(memoryUsage);
    return next();
  }
}