import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'

import { ProcessInstance, ProcessInstanceSchema } from 'src/models/process-instances/process-instances.schema';

import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';

import { ProcessInstanceController } from './process-instances.rest.controller';
import { ProcessInstanceService } from './process-instances.service';
import { Compiler } from './providers';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { WebhookConnector } from '../webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { ProcessInstanceGrpcController } from './process-instances.grpc.controller';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { KafkaConnector } from 'src/shared/connectors/kafka.connector';
import { SoapResponseParser, Transform } from 'src/common/utils';
import { ValidationsRepositoryImpl } from 'src/models/validations/repository/validations.repository.impl';
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
    MongooseModule.forFeature([{ name: ProcessInstance.name, schema: ProcessInstanceSchema }]),
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
  ],
  controllers: [ProcessInstanceController, ProcessInstanceGrpcController],
  providers: [ProcessInstanceService, ProcessInstanceRepositoryImpl, ProcessDefinitionRepositoryImpl, WebhookRepositoryImpl, Compiler, UserTasksRepositoryImpl, HttpConnector, GrpcConnector, WebhookConnector,
    SoapConnector,
    KafkaConnector,
    MysqlConnector,
    PostgresConnector,
    Audits,
    SoapResponseParser,
    Transform,
    ValidationsRepositoryImpl,
    ConnectorRepositoryImpl,
    ConnectorEvaluate,
    ExecutorService,
    DataTransformer
  ],
})
export class ProcessInstancesModule { }
