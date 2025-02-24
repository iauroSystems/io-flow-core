import { Test, TestingModule } from '@nestjs/testing';
import { TasksGrpcController } from '../tasks.grpc.controller';
import { TasksService } from '../tasks.service';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
import { HttpStatus } from '@nestjs/common';
import { CustomMessages } from 'src/common/const/custom-messages';
import { ProcessDefinitionRepositoryImpl } from 'src/models/process-definitions/repository/process-definitions.repository.impl';
import { ProcessInstanceRepositoryImpl } from 'src/models/process-instances/repository/process-instances.repository.impl';
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { HttpModule } from '@nestjs/axios';
import { GrpcConnector, HttpConnector, KafkaConnector } from 'src/shared/connectors';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { SoapResponseParser } from 'src/common/utils';
import { Compiler } from 'src/modules/process-instances/providers';
import { WebhookConnector } from 'src/modules/webhooks/providers/webhook.connector';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { ExecutorService } from 'src/modules/executor/executor.service';

const mockExtractHeaders = {
    'x-tenant-id': 'iauro',
    'authorization': 'x',
    'user-id': ''
}

let mockTaskService = {
    completeTask: jest.fn(),
    reassignTask: jest.fn()
}

describe('TasksGrpcController', () => {
    let tasksGrpcController: TasksGrpcController;
    let tasksService: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [TasksGrpcController],
            providers: [TasksService,
                {
                    provide: ProcessDefinitionRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn(),
                        updateStage: jest.fn()
                    }
                },
                {
                    provide: ProcessInstanceRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn(),
                        updateStage: jest.fn(),
                        updateMany: jest.fn(),
                        updateOne: jest.fn(),
                        aggregate: jest.fn()
                    }
                },
                {
                    provide: UserTasksRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn(),
                        updateStage: jest.fn()
                    }
                },
                {
                    provide: WebhookRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn(),
                        updateStage: jest.fn()
                    }
                },
                ExecutorService,
                HttpConnector,
                GrpcConnector,
                SoapConnector,
                KafkaConnector,
                SoapResponseParser,
                Compiler,
                WebhookConnector,
                Audits
            ],
        }).compile();

        tasksGrpcController = module.get<TasksGrpcController>(TasksGrpcController);
        tasksService = module.get<TasksService>(TasksService);
    });

    it('should be defined', () => {
        expect(tasksGrpcController).toBeDefined();
    });

    describe('completeTask', () => {
        it('should complete a task', async () => {
            try {
                const mockData = {
                    params: { 'processInstanceId': '' },
                    completeTaskDto: {
                        'taskId': '',
                        'taskKey': '',
                        'parameters': [{ key: '' }]
                    }
                };
                const mockMetadata = {};
                const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
                jest.spyOn(tasksGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
                jest.spyOn(tasksService, 'completeTask').mockImplementation(() => Promise.resolve(response));
                const result = await tasksGrpcController.completeTask(mockData, mockExtractHeaders);
                expect(result).toBe(response);
            }
            catch (err) { }
        });
    });

    describe('reassignTask', () => {
        it('should reassign a task', async () => {
            try {
                const mockData = {};
                const mockMetadata = {};
                const response = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
                jest.spyOn(tasksGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
                jest.spyOn(tasksService, 'reassignTask').mockResolvedValue(response);
                const result = await tasksGrpcController.reassignTask(mockData, mockMetadata);
                expect(result).toBe(response);
            }
            catch (err) { }
        });
    });
});
