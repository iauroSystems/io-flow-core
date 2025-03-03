import { HttpModule } from '@nestjs/axios'
import { ProcessInstance, ProcessInstanceSchema } from 'src/models/process-instances/process-instances.schema';
import { ProcessDefinition, ProcessDefinitionSchema } from "src/models/process-definitions/process-definitions.schema";
import { Webhook, WebhookSchema } from "src/models/webhooks/webhooks.schema";
import { UserTasks, UserTasksSchema } from 'src/models/user-tasks/user-tasks.schema';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { ProcessInstanceController } from '../process-instances.rest.controller';
import { ProcessInstanceService } from '../process-instances.service';
import { Compiler } from '../providers';
import { HttpConnector, GrpcConnector, KafkaConnector } from 'src/shared/connectors';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { WebhookConnector } from '../../webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { ProcessInstancesModule } from '../process-instances.module';
import { Test } from '@nestjs/testing';
import { ProcessDefinitionsModule } from '../../process-definitions/process-definitions.module';
import { WebhooksModule } from '../../webhooks/webhooks.module';
import { TasksModule } from '../../tasks/tasks.module';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { SoapResponseParser, Transform } from 'src/common/utils';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { MongooseModule } from '@nestjs/mongoose';
import { ExecutorService } from 'src/modules/executor/executor.service';

describe('ProcessInstanceModule', () => {
    let processInstanceService: ProcessInstanceService;
    let webhookRepository: WebhookRepositoryImpl;
    let controller: ProcessInstanceController;
    let processInstanceRepository: ProcessInstanceRepositoryImpl;
    let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
    let userTaskRepository: UserTasksRepositoryImpl;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ProcessInstancesModule,
                MongooseModule.forRoot([
                    { name: ProcessInstance.name, schema: ProcessInstanceSchema },
                    { name: ProcessDefinition.name, schema: ProcessDefinitionSchema },
                    { name: UserTasks.name, schema: UserTasksSchema },
                    { name: Webhook.name, schema: WebhookSchema }
                ] as any),
                HttpModule,
                ProcessDefinitionsModule,
                WebhooksModule,
                TasksModule,
                // SchedulerRegistry,
                ScheduleModule.forRoot()
            ],
            controllers: [ProcessInstanceController],
            providers: [
                ProcessInstanceService,
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
                SchedulerRegistry,
                Transform,
                SoapConnector,
                KafkaConnector,
                SoapResponseParser
            ]
        }).compile();
        processInstanceService = moduleRef.get<ProcessInstanceService>(ProcessInstanceService);
        webhookRepository = moduleRef.get<WebhookRepositoryImpl>(WebhookRepositoryImpl);
        controller = moduleRef.get<ProcessInstanceController>(ProcessInstanceController);
        processInstanceRepository = moduleRef.get<ProcessInstanceRepositoryImpl>(ProcessInstanceRepositoryImpl);
        processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
        userTaskRepository = moduleRef.get<UserTasksRepositoryImpl>(UserTasksRepositoryImpl);
    })

    describe('ProcessInstanceService', () => {
        it('should be defined', () => {
            expect(processInstanceService).toBeDefined();
        });
    });
})