import { Global, Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import { Compiler } from '../process-instances/providers';
import { TasksModule } from '../tasks/tasks.module';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { GrpcConnector, HttpConnector, KafkaConnector } from 'src/shared/connectors';
import { WebhookConnector } from '../webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { SoapResponseParser } from 'src/common/utils/soap-response-parser';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { ConnectorRepositoryImpl } from 'src/models/connectors/repository/connectors.repository.impl';
import { ConnectorEvaluate } from '../connectors/providers/connector-evaluate';
import { MysqlConnector } from 'src/shared/connectors/mysql.connector';
import { PostgresConnector } from 'src/shared/connectors/postgres.connector';
import { DataTransformer } from './providers/data-transformer';


@Global()
@Module({
  imports: [HttpModule],
  providers: [ExecutorService, ProcessInstanceRepositoryImpl,
    UserTasksRepositoryImpl, HttpConnector, GrpcConnector, Compiler,
    WebhookConnector, Audits, SoapConnector, KafkaConnector, MysqlConnector, PostgresConnector, SoapResponseParser, WebhookRepositoryImpl,
    ConnectorRepositoryImpl, ConnectorEvaluate, DataTransformer
  ]
})
export class ExecutorModule { }
