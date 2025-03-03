import { HttpStatus, Injectable, Logger, Scope, UseFilters } from '@nestjs/common';
import * as moment from 'moment';
import { TasksService } from '../tasks.service';
import { CompleteTaskBody, CompleteTaskParams, GetTasksQueryDto, CompleteTasksHeadersDto, GetTasksParamsDto, GetMyTasksHeadersDto, GetMyTasksParamsDto, GetMyTasksQueryDto, ReAssignTaskBody } from '../dtos';
import CustomResponse from 'src/common/providers/custom-response.service';
import CustomError from 'src/common/exceptions/custom-error';
import { CustomMessages } from 'src/common/const/custom-messages';
import { Constants } from 'src/common/const/constants'
import { ProcessInstanceRepositoryImpl } from "src/models/process-instances/repository/process-instances.repository.impl";
import { ProcessDefinitionRepositoryImpl } from "src/models/process-definitions/repository/process-definitions.repository.impl";
import { UserTasksRepositoryImpl } from 'src/models/user-tasks/repository/user-tasks.repository.impl';
import { CommonHeadersDto } from 'src/shared/dtos';
import { GetProcessInstanceStatsQueryDto } from '../../process-instances/dtos';
import { InputStatuses } from 'src/common/const/enums';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ProcessInstance } from 'src/models/process-instances/process-instances.schema';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { Audits } from 'src/shared/clients/audit-service/audit-service.provider';
import { GrpcConnector, HttpConnector, KafkaConnector } from 'src/shared/connectors';
import { ProcessInstanceService } from '../../process-instances/process-instances.service';
import { Compiler } from '../../process-instances/providers';
import { WebhookConnector } from '../../webhooks/providers/webhook.connector';
import { HttpModule } from '@nestjs/axios';
import { ProcessDefinition } from 'src/models/process-definitions/process-definitions.schema';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { SoapResponseParser } from 'src/common/utils';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
import { CustomRpcException } from 'src/common/exceptions/custom-grpc-error';
import { ExecutorService } from 'src/modules/executor/executor.service';


const mockService = {
    completeTask: jest.fn(),
    reassignTask: jest.fn(),
    findAllUserAssignedTasks: jest.fn(),
    findTasks: jest.fn(),
    getTasksStats: jest.fn(),
    taskDetails: jest.fn()
}



const headers: CommonHeadersDto = {
    "x-tenant-id": "",
    "authorization": "",
    "user-id": ""
}

const params: CompleteTaskParams = {
    processInstanceId: 'kalyani-id1'
}

const taskDataComplete: CompleteTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    parameters: [''],
    status: InputStatuses.COMPLETE,
}

const taskDataOnhold: CompleteTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    parameters: [''],
    status: InputStatuses.HOLD,
}

const taskDataCancelled: CompleteTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    parameters: [''],
    status: InputStatuses.CANCEL,
}

const taskDataResume: CompleteTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    parameters: [''],
    status: InputStatuses.RESUME,
}

const taskDataDefault: CompleteTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    parameters: [''],
    status: InputStatuses.EMPTY,
}

const taskDataDummy: CompleteTaskBody = {
    taskId: null,
    taskKey: null,
    parameters: [''],
    status: InputStatuses.COMPLETE
}
const taskDataDummy2: CompleteTaskBody = {
    taskId: null,
    taskKey: null,
    parameters: [''],
    status: InputStatuses.HOLD
}

const ReAssignTaskData = new ReAssignTaskBody;
const ReAssignTaskDataDummy: ReAssignTaskBody = {
    taskId: 'task123',
    taskKey: 'SSM',
    assignee: 'abc',
    watchers: ['a', 'b'],
    parameters: ['a', 'b']
}
const ReAssignTaskBodyDummyTwo: ReAssignTaskBody = {
    taskId: null,
    taskKey: null,
    assignee: 'f',
    watchers: ['s', 'r'],
    parameters: ['a', 'n']
}

const getMyTasksQueryDtoFailure: GetMyTasksQueryDto = {
    page: 0,
    size: 0,
    filters: '{"status": "open"}',
    customFilters: '',
    sort: '{ "createdAt": -1 }',
    search: ''
}
const getMyTasksQueryDto: any = new GetMyTasksQueryDto;

const queryFindAll = {
    page: 0,
    size: 0,
    filters: '',
    customFilters: '',
    sort: '',
    search: ''
}


jest.mock('../../../models/process-definitions/process-definitions.schema', () => ({
    __esModule: true,
    ProcessDefinition: class ProcessDefinitionMock {
        static findOne = jest.fn();
        static create = jest.fn();
        static findByIdAndUpdate = jest.fn();
        static findByIdAndRemove = jest.fn();
    },
}));
const processDefinitionMock = new ProcessDefinition();

jest.mock('../../../models/process-instances/process-instances.schema.ts', () => ({
    __esModule: true,
    ProcessInstance: class ProcessInstanceMock {
        static findOne = jest.fn();
        static create = jest.fn();
        static findByIdAndUpdate = jest.fn();
        static findByIdAndRemove = jest.fn();
    },
}));

let processInstanceMock: any = new ProcessInstance();


describe('TasksService', () => {
    let service: TasksService;
    let processInstanceRepository: ProcessInstanceRepositoryImpl;
    let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
    let userTasksRepository: UserTasksRepositoryImpl;
    let executer: ExecutorService;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [HttpModule],
            providers: [
                TasksService,
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

                {
                    provide: UserTasksRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn(),
                        updateStage: jest.fn(),
                        aggregate: jest.fn()
                    }
                },
                {
                    provide: getModelToken(ProcessInstance.name),
                    useValue: mockService

                },
                {
                    provide: ExecutorService,
                    useValue: {
                        parseAndReplaceValue: jest.fn(),
                        instanceLocator: jest.fn(),
                        valueLocator: jest.fn(),
                        iterateNextStages: jest.fn(),
                        gatewayHandler: jest.fn(),
                        reopenProcessInstance: jest.fn(),
                        createChildProcessInstance: jest.fn(),
                        callConnector: jest.fn(),
                        makeMultipleStagesActive: jest.fn(),
                        makeStageActive: jest.fn(),
                        retry: jest.fn(),
                        sleep: jest.fn(),
                        caller: jest.fn(),
                        makeTaskComplete: jest.fn(),
                        changeTaskAssignee: jest.fn(),
                        triggerDependencyGateway: jest.fn(),
                        createUserTasks: jest.fn(),
                        onStageActive: jest.fn(),
                        startFlow: jest.fn(),
                        makeFlowEnd: jest.fn(),
                        onFlowEnd: jest.fn(),
                        goToNextStage: jest.fn(),
                        updateFlowFlagStatuses: jest.fn(),
                        makeFlowHold: jest.fn(),
                        makeFlowCancel: jest.fn(),
                        makeFlowResume: jest.fn(),
                        saveParams: jest.fn(),
                        makeTimerEventEnd: jest.fn(),
                        instances: jest.fn()
                    }
                },
                // Executor,
                GrpcConnector,
                HttpConnector,
                Compiler,
                WebhookConnector,
                Audits,
                SoapConnector,
                SoapResponseParser,
                KafkaConnector

            ]
        }).compile();
        service = moduleRef.get<TasksService>(TasksService)
        processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
        processInstanceRepository = moduleRef.get<ProcessInstanceRepositoryImpl>(ProcessInstanceRepositoryImpl)
        userTasksRepository = moduleRef.get<UserTasksRepositoryImpl>(UserTasksRepositoryImpl);
        executer = moduleRef.get<ExecutorService>(ExecutorService);


    })
    describe('service', () => {
        it('service is defined', async () => {
            expect(service).toBeDefined();
        })
    })

    describe('completeTask', () => {
        it('should complete an active task and return a CustomResponse', async () => {
            const processInstance = {
                _id: 'process123',
                stages: [
                    {
                        _id: 'task123',
                        type: Constants.STAGE_TYPES.ACTIVITY,
                        subType: Constants.STAGE_SUB_TYPES.TASK,
                        status: Constants.STAGE_STATUSES.COMPLETED
                    }
                ],
                status: Constants.STAGE_STATUSES.ON_HOLD
            };
            processInstanceMock.stages = [
                {
                    _id: 'task123',
                    key: 'SSM',
                    status: Constants.STAGE_STATUSES.ACTIVE,
                    subType: Constants.STAGE_SUB_TYPES.END
                }
            ]
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_ENDED);
            jest.spyOn(executer, 'makeFlowEnd').mockResolvedValueOnce({} as any)
            jest.spyOn(executer, 'makeTaskComplete').mockImplementation(() => Promise.resolve());
            const result = await service.completeTask(headers, params, taskDataComplete, false);
            expect(result).toEqual(expectedResult);
        });

        it('should complete an active task and return a CustomGrpcResponse', async () => {
            const processInstance = {
                _id: 'process123',
                stages: [
                    {
                        _id: 'task123',
                        type: Constants.STAGE_TYPES.ACTIVITY,
                        subType: Constants.STAGE_SUB_TYPES.TASK,
                        status: Constants.STAGE_STATUSES.COMPLETED
                    }
                ],
                status: Constants.STAGE_STATUSES.ON_HOLD
            };
            processInstanceMock.stages = [
                {
                    _id: 'task123',
                    key: 'SSM',
                    status: Constants.STAGE_STATUSES.ACTIVE,
                    subType: Constants.STAGE_SUB_TYPES.END
                }
            ]
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedResult = new CustomGrpcResponse(0, CustomMessages.WORKFLOW_ENDED);
            jest.spyOn(executer, 'makeFlowEnd').mockResolvedValueOnce({} as any)
            jest.spyOn(executer, 'makeTaskComplete').mockImplementation(() => Promise.resolve());
            const result = await service.completeTask(headers, params, taskDataComplete, true);
            expect(result).toEqual(expectedResult);
        });

        it('should throw error when task is already on hold (grpc call)', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ON_HOLD,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataOnhold, true)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already on hold', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ON_HOLD,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataOnhold, false)).rejects.toThrowError(expectedError);
        });

        it('should hold the active task', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ACTIVE,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'makeFlowHold').mockImplementation(() => Promise.resolve());
            service.completeTask(headers, params, taskDataOnhold, false)
        });

        it('should throw error when task is already cancelled (grpc call)', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.CANCELLED,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataCancelled, true)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already cancelled', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.CANCELLED,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataCancelled, false)).rejects.toThrowError(expectedError);
        });

        it('should cancel the active task', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ACTIVE,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'makeFlowCancel').mockImplementation(() => Promise.resolve());
            service.completeTask(headers, params, taskDataCancelled, false)
        });

        it('should throw error when task is already resumed (grpc call) and instance status is active', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ACTIVE,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataResume, true)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already resumed and instance status is active', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ACTIVE,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstanceMock.status}`);
            await expect(service.completeTask(headers, params, taskDataResume, false)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already resumed (grpc call) and instance status is not active', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.WAITING,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, CustomMessages.FLOW_NOT_ON_HOLD);
            await expect(service.completeTask(headers, params, taskDataResume, true)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already resumed and instance status is not active', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.RUNNING,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.FLOW_NOT_ON_HOLD);
            await expect(service.completeTask(headers, params, taskDataResume, false)).rejects.toThrowError(expectedError);
        });


        it('should resume the active task', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.ON_HOLD,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'makeFlowResume').mockImplementation(() => Promise.resolve());
            service.completeTask(headers, params, taskDataResume, false)
        });

        it('should throw error when task is already cancelled or on hold (grpc call)', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.CANCELLED,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, `The flow is in ${processInstanceMock.status} state`);
            await expect(service.completeTask(headers, params, taskDataDefault, true)).rejects.toThrowError(expectedError);
        });

        it('should throw error when task is already cancelled or on hold', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.CANCELLED,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const expectedError = new CustomRpcException(3, `The flow is in ${processInstanceMock.status} state`);
            await expect(service.completeTask(headers, params, taskDataDefault, false)).rejects.toThrowError(expectedError);
        });

        it('should save params when task is empty', async () => {
            processInstanceMock = {
                status: Constants.STAGE_STATUSES.WAITING,
                stages: [
                    {
                        _id: 'task123',
                        key: 'SSM',
                        status: Constants.STAGE_STATUSES.ACTIVE,
                        subType: Constants.STAGE_SUB_TYPES.END,
                    },
                ],
            };

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'saveParams').mockImplementation(() => Promise.resolve());
            service.completeTask(headers, params, taskDataDefault, false)
        });

        it('should throw a CustomError when task is not found', async () => {
            const processInstance = {
                _id: 'process123',
                stages: [],
                status: Constants.STAGE_STATUSES.ACTIVE,
                subType: Constants.STAGE_SUB_TYPES.END
            };
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, 'Input data is not correct');
            const processInstanceRepositoryImplMock = {
                findOne: jest.fn().mockReturnValue(processInstance)
            };
            await expect(service.completeTask(headers, params, taskDataComplete)).rejects.toEqual(expectedError);
        });

        it('should check the value of taskData.status and throw error when taskId and taskKey is null ... when it is grpc call', async () => {
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, 'task not found');
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            await expect(service.completeTask(headers, params, taskDataDummy, true)).rejects.toEqual(expectedError);
        })

        it('should check the value of taskData.status and throw error when taskId and taskKey is null ... ', async () => {
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, 'task not found');
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            await expect(service.completeTask(headers, params, taskDataDummy, false)).rejects.toEqual(expectedError);
        })

        // it('should check the value of taskData.status and throw error when taskId and taskKey is null ... when it is HOLD',async()=>{
        //     jest.spyOn(processInstanceRepository,'findOne').mockResolvedValueOnce(processInstanceMock);
        //     const expectedError=new CustomError(HttpStatus.BAD_REQUEST, `Already ${processInstanceMock.status}`);
        //     const result=await service.completeTask(headers,params,taskDataDummy2);
        //     expect(result).toBeInstanceOf(CustomResponse);
        // })

        it('should throw an error if processInstance is not found when it is grpc call', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.completeTask(headers, params, taskDataDummy, true)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST),
            );
        });

        it('should throw an error if processInstance is not found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.completeTask(headers, params, taskDataDummy, false)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST),
            );
        });
    });

    describe('reassignTask', () => {
        it('should throw an error if assignee and watchers are not provided when it is grpc call', async () => {
            await expect(service.reassignTask(headers, params, ReAssignTaskData, true)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, 'assignee and watchers must be specified'),
            );
        });

        it('should throw an error if processInstance is not found when it is grpc call', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.reassignTask(headers, params, ReAssignTaskDataDummy, true)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST),
            );
        });

        it('should throw an error if assignee and watchers are not provided', async () => {
            await expect(service.reassignTask(headers, params, ReAssignTaskData, false)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, 'assignee and watchers must be specified'),
            );
        });

        it('should throw an error if processInstance is not found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.reassignTask(headers, params, ReAssignTaskDataDummy, false)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.BAD_REQUEST),
            );
        });

        it('should throw an error if task is not found when grpc call is true', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            await expect(service.reassignTask(headers, params, ReAssignTaskBodyDummyTwo, true)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, 'task not found'),
            );
        });

        it('should throw an error if task is not found when grpc call is true', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            await expect(service.reassignTask(headers, params, ReAssignTaskBodyDummyTwo, false)).rejects.toThrow(
                new CustomError(HttpStatus.BAD_REQUEST, 'task not found'),
            );
        });

        it('should update the reassigned task', async () => {
            processInstanceMock.stages = [
                {
                    _id: 'task123',
                    key: 'SSM'
                }
            ]
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'changeTaskAssignee').mockImplementation();
            const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.TASK_UPDATED);
            const result = await service.reassignTask(headers, params, ReAssignTaskDataDummy, false)
            expect(result).toEqual(expectedResult);
        })

        it('should update the reassigned task when task key is present', async () => {
            delete ReAssignTaskDataDummy['taskId']
            processInstanceMock.stages = [
                {
                    _id: 'task123',
                    key: 'SSM'
                }
            ]
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'changeTaskAssignee').mockImplementation();
            const expectedResult = new CustomGrpcResponse(0, CustomMessages.TASK_UPDATED);
            const result = await service.reassignTask(headers, params, ReAssignTaskDataDummy, true)
            expect(result).toEqual(expectedResult);
        })
    });

    describe('findAllUserAssignedTasks', () => {
        it('should return count and data of user assigned tasks', async () => {
            getMyTasksQueryDto.search = JSON.stringify({ someSearch: 'someValue' })
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return count and data of user assigned tasks when custom filter is overdue', async () => {
            getMyTasksQueryDto.customFilters = JSON.stringify({ filterBy: 'overdue' });
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return count and data of user assigned tasks when custom filter is today', async () => {
            getMyTasksQueryDto.customFilters = JSON.stringify({ filterBy: 'today' });
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return count and data of user assigned tasks when custom filter is upcoming', async () => {
            getMyTasksQueryDto.customFilters = JSON.stringify({ filterBy: 'upcoming' });
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return count and data of user assigned tasks when custom filter has expEndDate', async () => {
            getMyTasksQueryDto.customFilters = JSON.stringify({ expEndDate: '2023-11-06' });
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return count and data of user assigned tasks when custom filter has startDate and endDate', async () => {
            getMyTasksQueryDto.customFilters = JSON.stringify({ startDate: '2023-11-06', endDate: '2023-11-08' });
            jest.spyOn(userTasksRepository, 'count').mockResolvedValueOnce(5);
            jest.spyOn(userTasksRepository, 'find').mockImplementation();
            const result = await service.findAllUserAssignedTasks(headers, getMyTasksQueryDto);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should throw an error for invalid JSON in filters', async () => {
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, '[filters or customFilters] Invalid JSON');
            expect.assertions(0);
            try {
                await service.findAllUserAssignedTasks(headers, getMyTasksQueryDtoFailure);
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });

    })

    describe('findTasks', () => {


        it('should return error for invalid JSON in filters', async () => {
            queryFindAll.filters = '{invalidJson}';
            await expect(service.findTasks(headers, queryFindAll)).rejects.toThrowError(CustomError);
        });

        it('should return error for invalid JSON in customFilters', async () => {
            queryFindAll.customFilters = '{invalidJson}';
            await expect(service.findTasks(headers, queryFindAll)).rejects.toThrowError(CustomError);
        });

        it('should return error for invalid JSON in search', async () => {
            queryFindAll.search = '{invalidJson}';
            await expect(service.findTasks(headers, queryFindAll)).rejects.toThrowError(CustomError);
        });

        it('should return tasks based on filters and customFilters overdue', async () => {
            queryFindAll.filters = '{"status":"In progress"}';
            queryFindAll.customFilters = '{"filterBy":"overdue","expEndDate":"2023-11-05"}';
            queryFindAll.search = '';
            queryFindAll.page = 0;
            queryFindAll.size = 1;
            queryFindAll.sort = '';
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return tasks based on filters and customFilters today', async () => {
            queryFindAll.filters = '{"status":"In progress"}';
            queryFindAll.customFilters = '{"filterBy":"today","expEndDate":"2023-11-06"}';
            queryFindAll.search = '';
            queryFindAll.page = 0;
            queryFindAll.size = 1;
            queryFindAll.sort = '';
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return tasks based on filters and customFilters upcoming', async () => {
            queryFindAll.filters = '{"status":"In progress"}';
            queryFindAll.customFilters = '{"filterBy":"upcoming","expEndDate":"2023-11-07"}';
            queryFindAll.search = '';
            queryFindAll.page = 0;
            queryFindAll.size = 1;
            queryFindAll.sort = '';
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return tasks based on filters and customFilters startDate and endDate', async () => {
            queryFindAll.filters = '{"status":"In progress"}';
            queryFindAll.customFilters = JSON.stringify({ startDate: '2023-11-06', endDate: '2023-11-08' });
            queryFindAll.search = '';
            queryFindAll.page = 0;
            queryFindAll.size = 1;
            queryFindAll.sort = '';
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);
        });

        it('should return tasks based on search', async () => {
            queryFindAll.search = '{"title":"test task"}';
            queryFindAll.customFilters = '';
            queryFindAll.page = 0;
            queryFindAll.size = 1;
            queryFindAll.sort = '';
            queryFindAll.filters = '';
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);

        });

        it('should return tasks sorted in descending order by createdAt', async () => {
            queryFindAll.sort = '{"createdAt":"desc"}';
            queryFindAll.page = 0;
            queryFindAll.search = '';
            queryFindAll.filters = '';
            queryFindAll.customFilters = '';
            queryFindAll.search = ''
            const result = await service.findTasks(headers, queryFindAll);
            expect(result).toBeInstanceOf(CustomResponse);

        });

        it('should return overdue tasks', async () => {
            const expEndDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const customFilters = { filterBy: 'overdue' };
            queryFindAll.customFilters = JSON.stringify(customFilters);
            const condition = { $and: [{ $and: [{ expEndDate: { $ne: -1 } }, { expEndDate: { $lt: Date.now() } }] }] };
            const result = await service.findTasks(headers, queryFindAll);
        });

        it('should return tasks due today', async () => {
            const expEndDate = moment().startOf('day').valueOf();
            const customFilters = { filterBy: 'today' };
            queryFindAll.customFilters = JSON.stringify(customFilters);
            const condition = { $and: [{ $and: [{ expEndDate: { $gt: expEndDate } }, { expEndDate: { $lte: moment().endOf('day').valueOf() } }] }] };
            const userTaskRepositoryImplStub = {
                count: jest.fn(() => 1),
                find: jest.fn(() => []),
            };
            const result = await service.findTasks(headers, queryFindAll);
            expect(userTasksRepository.count).toHaveBeenCalledWith(condition);
        });


    });

    describe('getTasksStats', () => {
        const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, {
            _id: 'someValue',
            waiting: 1,
            active: 2,
            completed: 3,
            on_hold: 4,
            cancelled: 5,
            all: 15
        });
        const pipeline = [
            {
                $match: {
                    $and: [
                        { someField: 'someValue' },
                        { someFilter: 'someValue' },
                        {
                            createdAt: {
                                $gte: new Date('2023-11-06T00:00:00.000Z'),
                                $lt: new Date('2023-11-08T23:59:59.999Z')
                            }
                        },
                        { $or: [{ someSearch: { $regex: /someValue/i } }] }
                    ]
                }
            },
            {
                $group: {
                    _id: '$someField',
                    waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
                    active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                    completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                    on_hold: { $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    all: { $sum: 1 },
                }
            }
        ];
        it('getStats should return stats for valid inputs', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ startDate: '2023-11-06', endDate: '2023-11-08' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { startDate: '2023-11-06', endDate: '2023-11-08' };
            });
            jest.spyOn(userTasksRepository, 'aggregate').mockResolvedValue([
                {
                    _id: 'someValue',
                    waiting: 1,
                    active: 2,
                    completed: 3,
                    on_hold: 4,
                    cancelled: 5,
                    all: 15
                }]
            )
            const result = await service.getTasksStats(headers, query, true);
            expect(result).toEqual(expectedResult);
        });

        it('getStats should return stats for valid inputs when custom filter is overdue', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ filterBy: 'overdue' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { filterBy: 'overdue' };
            });
            jest.spyOn(userTasksRepository, 'aggregate').mockResolvedValue([
                {
                    _id: 'someValue',
                    waiting: 1,
                    active: 2,
                    completed: 3,
                    on_hold: 4,
                    cancelled: 5,
                    all: 15
                }]
            )
            const result = await service.getTasksStats(headers, query, true);
            expect(result).toEqual(expectedResult);
        });

        it('getStats should return stats for valid inputs when custom filter is today', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ filterBy: 'today' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { filterBy: 'today' };
            });
            jest.spyOn(userTasksRepository, 'aggregate').mockResolvedValue([
                {
                    _id: 'someValue',
                    waiting: 1,
                    active: 2,
                    completed: 3,
                    on_hold: 4,
                    cancelled: 5,
                    all: 15
                }]
            )
            const result = await service.getTasksStats(headers, query, true);
            expect(result).toEqual(expectedResult);
        });

        it('getStats should return stats for valid inputs when custom filter is upcoming', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ filterBy: 'upcoming' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { filterBy: 'upcoming' };
            });
            jest.spyOn(userTasksRepository, 'aggregate').mockResolvedValue([
                {
                    _id: 'someValue',
                    waiting: 1,
                    active: 2,
                    completed: 3,
                    on_hold: 4,
                    cancelled: 5,
                    all: 15
                }]
            )
            const result = await service.getTasksStats(headers, query, true);
            expect(result).toEqual(expectedResult);
        });

        it('getStats should return stats for valid inputs when custom filter has expEndDate', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ expEndDate: '2023-11-06' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { expEndDate: '2023-11-06' };
            });
            jest.spyOn(userTasksRepository, 'aggregate').mockResolvedValue([
                {
                    _id: 'someValue',
                    waiting: 1,
                    active: 2,
                    completed: 3,
                    on_hold: 4,
                    cancelled: 5,
                    all: 15
                }]
            )
            const result = await service.getTasksStats(headers, query, true);
            expect(result).toEqual(expectedResult);
        });

        // it('should return error for invalid JSON', async () => {
        //     const query = {
        //         filters: "invalid json",
        //         customFilters: JSON.stringify({ expEndDate: '2023-11-06' }),
        //         search: JSON.stringify({ someSearch: 'someValue' })
        //     };
        //     jest.spyOn(JSON, 'parse').mockImplementation(() => {
        //         return { expEndDate: '2023-11-06' };
        //     });
        //     jest.spyOn(userTasksRepository, 'aggregate').mockRejectedValue([{ }])
        //     const expectedError = new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`);
        //     const result = await service.getTasksStats(headers, query, true);
        //     await expect(result).rejects.toThrow(expectedError);
        // });
    })

    describe('updateTimer', () => {
        it('should update the timer event', async () => {
            const result = await service.updateTimer(headers);
            expect(executer.makeTimerEventEnd).toHaveBeenCalledWith(headers);
            expect(result).toEqual(new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS));
        })
    })
});
