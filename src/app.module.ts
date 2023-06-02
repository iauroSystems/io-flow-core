// require('dotenv').config({ path: `envs/.env.${process.env.NODE_ENV}` })

import { MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exceptions';
import { HttpRequestHeadersMiddleware } from './common/middlewares';
import { ResponseInterceptor } from './common/interceptors';
import { HttpModule } from '@nestjs/axios';
import { ProcessDefinitionsModule, ProcessInstancesModule, TasksModule } from './modules';
import { HttpConnector } from 'src/shared/connectors';
import { MongooseModule } from '@nestjs/mongoose';

// example run command
// export NODE_ENV=local && npm start

// hot reload with env
// export NODE_ENV=local && npm run start:any
// hot reload
// npm run start:dev
const MONGO_PROTOCOL = process.env.MONGO_PROTOCOL, MONGO_HOST = process.env.MONGO_HOST, MONGO_PORT = process.env.MONGO_PORT, MONGO_USER = process.env.MONGO_USER, MONGO_PASS = process.env.MONGO_PASS, MONGO_DBNAME = process.env.MONGO_DBNAME || 'tenancy', MONGO_CLUSTER_HOSTS = process.env.MONGO_CLUSTER_HOSTS,
  MONGO_REPLICA_SET = process.env.MONGO_REPLICA_SET;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `envs/.env.${process.env.NODE_ENV}`,
    }),
    HttpModule,
    MongooseModule.forRoot(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`),
    ProcessDefinitionsModule,
    ProcessInstancesModule,
    TasksModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    HttpConnector,
    HttpRequestHeadersMiddleware
  ],
})
export class AppModule {
  // Global Middleware, Inbound logging
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpRequestHeadersMiddleware).forRoutes('*');
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
