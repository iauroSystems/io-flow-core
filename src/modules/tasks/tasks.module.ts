import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'
import { UserTasks, UserTasksSchema } from 'src/models/user-tasks/user-tasks.schema';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { TasksController } from './tasks.rest.controller';
import { TasksService } from './tasks.service';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { Compiler } from '../process-instances/providers';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { WebhookConnector } from '../webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { TasksGrpcController } from './tasks.grpc.controller';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { KafkaConnector } from 'src/shared/connectors/kafka.connector';
import { SoapResponseParser } from 'src/common/utils';
import { ConnectorRepositoryImpl } from 'src/models/connectors/repository/connectors.repository.impl';
import { ConnectorEvaluate } from '../connectors/providers/connector-evaluate';
import { ExecutorService } from '../executor/executor.service';
import { MysqlConnector } from 'src/shared/connectors/mysql.connector';
import { PostgresConnector } from 'src/shared/connectors/postgres.connector';
import { DataTransformer } from '../executor/providers/data-transformer';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserTasks.name, schema: UserTasksSchema }]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'access-control',
        transport: Transport.GRPC,
        options: {
          url: `${process.env.RBAC_GRPC_URL}:${process.env.RBAC_GRPC_PORT}`,
          package: 'app',
          protoPath: join(
            __dirname,
            '../../../src/proto/access-control/access-control.proto',
          ),
        },
      },
    ]),
    // ExecutorModule,
  ],
  exports: [],
  controllers: [TasksController, TasksGrpcController],
  providers: [TasksService, UserTasksRepositoryImpl, ProcessInstanceRepositoryImpl, ProcessDefinitionRepositoryImpl, WebhookRepositoryImpl, HttpConnector, Compiler, GrpcConnector, MysqlConnector, PostgresConnector, WebhookConnector, Audits,
    SoapConnector,
    KafkaConnector,
    SoapResponseParser,
    ConnectorRepositoryImpl,
    ConnectorEvaluate,
    ExecutorService,
    DataTransformer
  ],
})
export class TasksModule { }
