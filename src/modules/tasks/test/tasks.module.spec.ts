import { HttpModule } from '@nestjs/axios'
import { UserTasks, UserTasksSchema } from 'src/models/user-tasks/user-tasks.schema';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { TasksController } from '../tasks.rest.controller';
import { TasksService } from '../tasks.service';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { Compiler } from '../../process-instances/providers';
import { HttpConnector, GrpcConnector } from 'src/shared/connectors';
import { WebhookConnector } from '../../webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { TasksModule } from '../tasks.module';
import { ProcessDefinitionsModule } from '../../process-definitions/process-definitions.module';
import { ProcessInstancesModule } from '../../process-instances/process-instances.module';
import { WebhooksModule } from '../../webhooks/webhooks.module';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { KafkaConnector } from 'src/shared/connectors/kafka.connector';
import { SoapResponseParser } from 'src/common/utils';
import { Test } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ExecutorService } from 'src/modules/executor/executor.service';

describe('TasksModule', () => {
    let taskService: TasksService;
    let taskController: TasksController;
    let userTaskRepository: UserTasksRepositoryImpl;
    let processInstanceRepository: ProcessInstanceRepositoryImpl;
    let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
    let webhookRepository: WebhookRepositoryImpl;
    let soapConnector: SoapConnector;
    let kafkaConnector: KafkaConnector;
    let soapResponseParser: SoapResponseParser;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot([{ name: UserTasks.name, schema: UserTasksSchema }] as any),
                TasksModule,
                HttpModule,
                ProcessDefinitionsModule,
                ProcessInstancesModule,
                WebhooksModule
            ],
            controllers: [
                TasksController
            ],
            providers: [
                Compiler,
                ExecutorService,
                GrpcConnector,
                HttpConnector,
                WebhookConnector,
                Audits,
                ProcessInstanceRepositoryImpl,
                ProcessDefinitionRepositoryImpl,
                UserTasksRepositoryImpl,
                WebhookRepositoryImpl,
                TasksService,
                SoapConnector,
                KafkaConnector,
                SoapResponseParser
            ]
        }).compile();
        taskService = moduleRef.get<TasksService>(TasksService);
        taskController = moduleRef.get<TasksController>(TasksController);
        userTaskRepository = moduleRef.get<UserTasksRepositoryImpl>(UserTasksRepositoryImpl);
        processInstanceRepository = moduleRef.get<ProcessInstanceRepositoryImpl>(ProcessInstanceRepositoryImpl);
        processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
        webhookRepository = moduleRef.get<WebhookRepositoryImpl>(WebhookRepositoryImpl);
        soapConnector = moduleRef.get<SoapConnector>(SoapConnector);
        kafkaConnector = moduleRef.get<KafkaConnector>(KafkaConnector);
        soapResponseParser = moduleRef.get<SoapResponseParser>(SoapResponseParser);
    })

    describe('TasksService', () => {
        it('should be defined', () => {
            expect(taskService).toBeDefined();
        })
    })

    describe('TasksContoller', () => {
        it('should be defined', () => {
            expect(taskController).toBeDefined();
        })
    })

    describe('UserTasksRepositoryImpl', () => {
        it('should be defined', () => {
            expect(userTaskRepository).toBeDefined();
        })
    })
})