
import { HttpStatus, MiddlewareConsumer, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exceptions';
import { AppLoggerMiddleware, HttpRequestHeadersMiddleware } from './common/middlewares';
import { ResponseInterceptor } from './common/interceptors';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ValidationsModule, ProcessDefinitionsModule, ProcessInstancesModule, TasksModule, WebhooksModule } from './modules';
import { ScheduleModule } from '@nestjs/schedule';
import { DataflowConversionModule } from './modules/dataflow-conversion/dataflow-conversion.module';
import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider, makeSummaryProvider, PrometheusModule } from "@willsoto/nestjs-prometheus";
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { MetricsMiddleware } from './common/middlewares/http-status-code.middleware';
import { ConnectorModule } from './modules/connectors/connectors.module';
// import { GlobalScheduleProvider } from './common/providers/global-schedule.provider';
import { ExecutorModule } from './modules/executor/executor.module';
import { CustomMessages } from './common/const/custom-messages';
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
    ScheduleModule.forRoot(),
    ProcessDefinitionsModule,
    ProcessInstancesModule,
    TasksModule,
    WebhooksModule,
    DataflowConversionModule,
    PrometheusModule.register(),
    ExecutorModule,
    ConnectorModule,
    ValidationsModule
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    makeCounterProvider({
      name: "metric_Counter",
      help: "metric_help",
    }),
    makeGaugeProvider({
      name: "metric_gauge",
      help: "metric_help",
    }),
    makeHistogramProvider({
      name: "metric_histogram",
      help: "metric_help",
    }),
    makeSummaryProvider({
      name: "metric_summary",
      help: "metric_help",
    }),
    HttpConnector,
    HttpRequestHeadersMiddleware,
    // GlobalScheduleProvider
  ],
  // exports: [GlobalScheduleProvider]
})
export class AppModule {
  // Global Middleware, Inbound logging
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpRequestHeadersMiddleware).forRoutes('*');
    // consumer.apply(AppLoggerMiddleware).forRoutes('*');
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}

