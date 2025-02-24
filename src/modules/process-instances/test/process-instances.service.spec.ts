import { HttpStatus } from '@nestjs/common';
import { ProcessInstance } from '../../../../src/models/process-instances/process-instances.schema';
import { UpdateProcessInstanceDto, GetProcessInstanceQueryDto, GetProcessInstanceStatsQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceQueryDto, StartProcessInstanceBodyDto } from '../dtos';
import CustomResponse from '../../../../src/common/providers/custom-response.service';
import CustomError from '../../../../src/common/exceptions/custom-error';
import { CustomMessages } from '../../../../src/common/const/custom-messages';
import { ProcessInstanceRepositoryImpl } from '../../../../src/models/process-instances/repository/process-instances.repository.impl';
import { ProcessDefinitionRepositoryImpl } from "../../../../src/models/process-definitions/repository/process-definitions.repository.impl";
import { UserTasksRepositoryImpl } from '../../../../src/models/user-tasks/repository/user-tasks.repository.impl';
import { Compiler } from '../providers/compiler';
import { WebhookConnector } from '../../webhooks/providers/webhook.connector';
import { Audits } from '../../../../src/shared/clients/audit-service/audit-service.provider';
import { CommonHeadersDto } from '../../../../src/shared/dtos';
import * as moment from 'moment';
import { ProcessInstanceService } from '../process-instances.service';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { GrpcConnector, HttpConnector, KafkaConnector } from 'src/shared/connectors';
import { WebhookRepositoryImpl } from 'src/models/webhooks/repository/webhooks.repository.impl';
import { ProcessDefinition } from '../../../../src/models/process-definitions/process-definitions.schema';
import { SoapResponseParser, Transform } from 'src/common/utils';
import { SoapConnector } from 'src/shared/connectors/soap.connector';
import { CustomRpcException } from 'src/common/exceptions/custom-grpc-error';
import CustomGrpcResponse from 'src/common/providers/custom-grpc-response.service';
import { ExecutorService } from 'src/modules/executor/executor.service';

const mockService = {
    createByDefinitionId: jest.fn(),
    createByDefinitionKey: jest.fn(),
    start: jest.fn(),
    updateInstances: jest.fn(),
    getInstancesByDefinitionId: jest.fn(),
    getInstancesByDefinitionKey: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getStatsByDefinitionId: jest.fn(),
    getStatsByDefinitionKey: jest.fn(),
    getStats: jest.fn(),
    runByDefinitionId: jest.fn(),
    runByDefinitionKey: jest.fn(),
    runFlow: jest.fn(),

}

const headers: CommonHeadersDto = {
    "x-tenant-id": "",
    "authorization": "",
    "user-id": ""
}

//Mocking Process Definition
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


jest.mock('../../../models/process-instances/process-instances.schema', () => ({
    __esModule: true,
    ProcessInstance: class ProcessInstanceMock {
        static findOne = jest.fn();
        static create = jest.fn();
        static findByIdAndUpdate = jest.fn();
        static findByIdAndRemove = jest.fn();
    },
}));

const processInstanceMock: any = new ProcessInstance();
const getOneProcessInstanceQueryDto = new GetOneProcessInstanceQueryDto;
const startProcessInstanceBodyDto = new StartProcessInstanceBodyDto;
const updateProcessInstanceDto = new UpdateProcessInstanceDto;
const updateProcessInstanceQueryDto = new UpdateProcessInstanceQueryDto;
const getProcessInstanceStatsQueryDto = new GetProcessInstanceStatsQueryDto;
const updateProcessInstanceQueryDtoDummy = { cascade: 'true' };
const updateProcessInstanceQueryDtoDummyTwo = { cascade: 'false' };
const getProcessInstanceQueryDto = new GetProcessInstanceQueryDto;

describe('Process-InstanceService', () => {
    let service: ProcessInstanceService;
    let processInstanceRepository: ProcessInstanceRepositoryImpl;
    let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
    let webhookRepository: WebhookRepositoryImpl;
    let userTasksRepository: UserTasksRepositoryImpl;
    let compiler: Compiler;
    let audits: Audits;
    let executer: ExecutorService;
    let webhook: WebhookConnector;
    let transform: Transform;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [HttpModule],
            providers: [
                ProcessInstanceService,
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
                        updateStage: jest.fn()
                    }
                },
                {
                    provide: getModelToken(ProcessInstance.name),
                    useValue: mockService

                },
                {
                    provide: Audits,
                    useValue: {
                        pushAuditLogs: jest.fn(),
                    },
                },
                {
                    provide: Compiler,
                    useValue: {
                        compileV2: jest.fn(),
                        compile: jest.fn()
                    },
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
                        instances: jest.fn(),
                        validateParameters: jest.fn(),
                    }
                },
                WebhookConnector,
                GrpcConnector,
                HttpConnector,
                Transform,
                SoapConnector,
                KafkaConnector,
                SoapResponseParser
            ]
        }).compile();
        service = moduleRef.get<ProcessInstanceService>(ProcessInstanceService)
        processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
        processInstanceRepository = moduleRef.get<ProcessInstanceRepositoryImpl>(ProcessInstanceRepositoryImpl)
        webhookRepository = moduleRef.get<WebhookRepositoryImpl>(WebhookRepositoryImpl)
        userTasksRepository = moduleRef.get<UserTasksRepositoryImpl>(UserTasksRepositoryImpl);
        executer = moduleRef.get<ExecutorService>(ExecutorService);
        webhook = moduleRef.get<WebhookConnector>(WebhookConnector);
        transform = moduleRef.get<Transform>(Transform);
        compiler = moduleRef.get<Compiler>(Compiler);
        audits = moduleRef.get<Audits>(Audits);
    })

    describe('service', () => {
        it('service is defined', async () => {
            expect(service).toBeDefined();
        })
    })

    describe('createByDefinitionId', () => {
        it('should throw an error if workflow not found', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.createByDefinitionId(headers, '', getOneProcessInstanceQueryDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should createByDefinitionId and give a success response', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(processInstanceRepository, 'create').mockResolvedValueOnce(processInstanceMock);
            const response = await service.createByDefinitionId(headers, '', getOneProcessInstanceQueryDto, false);
            const expectedResponse = new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, {});
            expect(response).toEqual(expectedResponse);
        })

        it('should throw an error if workflow not found and the call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.createByDefinitionId(headers, '', getOneProcessInstanceQueryDto, true)).rejects.toThrowError(
                new CustomRpcException(3, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should createByDefinitionId and give a success response and the call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(processInstanceRepository, 'create').mockResolvedValueOnce(processInstanceMock);
            const response = await service.createByDefinitionId(headers, '', getOneProcessInstanceQueryDto, true);
            const expectedResponse = new CustomGrpcResponse(0, CustomMessages.PROCESS_INSTANCE_CREATED, {});
            expect(response).toEqual(expectedResponse);
        })
    })

    describe('createByDefinitionKey', () => {
        it('should throw an error if workflow not found ', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.createByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should createByDefinitionKey and give a success response', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(processInstanceRepository, 'create').mockResolvedValueOnce(processInstanceMock);
            const response = await service.createByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', false);
            const expectedResponse = new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED, {});
            expect(response).toEqual(expectedResponse);
        })

        it('should throw an error if workflow not found and the call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.createByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', true)).rejects.toThrowError(
                new CustomRpcException(3, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should createByDefinitionKey and give a success response and the call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(processInstanceRepository, 'create').mockResolvedValueOnce(processInstanceMock);
            const response = await service.createByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', true);
            const expectedResponse = new CustomGrpcResponse(0, CustomMessages.PROCESS_INSTANCE_CREATED, {});
            expect(response).toEqual(expectedResponse);
        })
    })



    describe('start', () => {
        it('should throw an error if processInstance not found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.start('', startProcessInstanceBodyDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.PROCESS_INSTANCE_NOT_FOUND),
            );
        })

        it('should throw an error if processInstance not found and the call is grpc', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.start('', startProcessInstanceBodyDto, true)).rejects.toThrowError(
                new CustomRpcException(3, CustomMessages.PROCESS_INSTANCE_NOT_FOUND),
            );
        })

        it('should execute start successfully', async () => {
            processInstanceMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: true,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, '']);
            jest.spyOn(executer, 'startFlow').mockImplementation()
            const response = await service.start('', startProcessInstanceBodyDto, false);
            const expectedResponse = new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_STARTED);
            expect(response).toEqual(expectedResponse);
        })

        it('should throw an error if isValid is false', async () => {
            processInstanceMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: true,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([false, '']);
            const error = ''
            await expect(service.start('', startProcessInstanceBodyDto)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition')
            );
        })

        it('should execute start successfully when the call is grpc', async () => {
            processInstanceMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: true,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }

            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, '']);
            jest.spyOn(executer, 'startFlow').mockImplementation()
            const response = await service.start('', startProcessInstanceBodyDto, true);
            const expectedResponse = new CustomGrpcResponse(0, CustomMessages.PROCESS_INSTANCE_STARTED);
            expect(response).toEqual(expectedResponse);
        })
    })

    describe('updateInstance', () => {
        it('should throw an error if workflow not found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.updateInstances('', updateProcessInstanceDto, updateProcessInstanceQueryDto)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND),
            );
        })

        it('should update the instance and give success response when cascade is true', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(processInstanceRepository, 'updateMany').mockResolvedValueOnce('');
            // jest.spyOn(processInstanceRepository, 'updateOne').mockResolvedValueOnce(processInstanceMock);
            const response = await service.updateInstances('', updateProcessInstanceDto, updateProcessInstanceQueryDtoDummy);
            expect(response).toBeInstanceOf(CustomResponse);
        })

        it('should update the instance and give success response when cascade is false', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            // jest.spyOn(processInstanceRepository, 'updateMany').mockResolvedValueOnce('');
            jest.spyOn(processInstanceRepository, 'updateOne').mockResolvedValueOnce(processInstanceMock);
            const response = await service.updateInstances('', updateProcessInstanceDto, updateProcessInstanceQueryDtoDummyTwo);
            expect(response).toBeInstanceOf(CustomResponse);
        })
    })

    describe('getInstancesByDefinitionId', () => {
        it('should call getInstancesByDefinitionId', async () => {
            let condition = '';
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(service, 'findAll').mockResolvedValueOnce(expectedResponse);
            expect(await service.getInstancesByDefinitionId('', getProcessInstanceQueryDto)).toBe(expectedResponse);
        })
    })

    describe('getInstancesByDefinitionKey', () => {
        it('should call getInstancesByDefinitionKey', async () => {
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(service, 'findAll').mockResolvedValueOnce(expectedResponse);
            expect(await service.getInstancesByDefinitionKey('', getProcessInstanceQueryDto)).toBe(expectedResponse);
        })
    })

    describe('findAll', () => {
        it('should return CustomResponse object with count and data properties', async () => {
            const rootCondition = { processDefinitionId: 'abc123' };
            const query = { filters: '{"status": "completed"}', page: 1, size: 10 };
            const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count: 5, data: [] });
            jest.spyOn(processInstanceRepository, 'count').mockResolvedValue(5);
            jest.spyOn(processInstanceRepository, 'find').mockResolvedValue([]);
            const result = await service.findAll(rootCondition, getProcessInstanceQueryDto);
            expect(result).toEqual(expectedResult);
        });

        it('should throw CustomError object with BAD_REQUEST status code and message for invalid JSON input', async () => {
            const rootCondition = { processDefinitionId: 'abc123' };
            const query = { filters: '{status": "completed"}', page: 1, size: 10 };
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`);
            jest.spyOn(processInstanceRepository, 'count').mockResolvedValue(5);
            jest.spyOn(processInstanceRepository, 'find').mockResolvedValue([]);

            try {
                await service.findAll(rootCondition, getProcessInstanceQueryDto);
            } catch (error) {
                expect(error).toEqual(expectedError);
            }
        });

        it('findAll should return correct output when no search, customFilters or sort query is provided', async () => {
            const rootCondition = { foo: 'bar' };
            const query: GetProcessInstanceQueryDto = {
                filters: '{"status":"active"}',
                page: 1,
                size: 10,
                customFilters: '',
                sort: null,
                search: null,
                projection: ''
            };
            const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count: 10, data: [{}] });
            jest.spyOn(processInstanceRepository, 'count').mockResolvedValue(10);
            jest.spyOn(processInstanceRepository, 'find').mockResolvedValue([processInstanceMock]);
            const result = await service.findAll(rootCondition, query);
            // expect(result).toEqual(expectedResult);
        });

        it('findAll should throw error when invalid JSON input is provided', async () => {
            const rootCondition = { foo: 'bar' };
            const query = {
                filters: '{invalid-json',
                customFilters: '{"startDate":"2022-11-07","endDate":"2022-11-08"}',
                search: '{"name":"john"}',
                sort: '{"createdAt":"asc"}',
                page: 1,
                size: 10,
                projection: ''
            };
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`);

            await expect(service.findAll(rootCondition, query)).rejects.toEqual(expectedError);
        });



        it('should push start and end dates to the condition array when customFilters is provided', async () => {
            const rootCondition = {};
            const query = {
                customFilters: JSON.stringify({ startDate: '2022-11-07', endDate: '2022-11-08' }),
                filters: '',
                search: '',
                sort: '',
                page: 1,
                size: 10,
                projection: ''
            };
            const expectedCondition = {
                $and: [{
                    createdAt: {
                        $gte: moment('2022-11-06').startOf('day'),
                        $lt: moment('2022-11-09').endOf('day')
                    }
                }, {}]
            };
            jest.spyOn(processInstanceRepository, 'count').mockResolvedValue(10);
            const data = jest.spyOn(processInstanceRepository, 'find').mockResolvedValue([processInstanceMock]);
            const response = await service.findAll(rootCondition, query);
        });

        it('should parse the sort query and assign to the sort variable', async () => {
            const rootCondition = {};
            const query = {
                size: 1,
                page: 1,
                search: '',
                customFilters: '',
                filters: '',
                sort: JSON.stringify({ name: 1, age: -1 }),
                projection: ''
            };
            const expectedSort = { name: 1, age: -1 };
            const result = await service.findAll(rootCondition, query);
        });

        it('should parse the search query and push to the condition array', async () => {
            const rootCondition = {};
            const query = {
                filters: '',
                sort: '',
                page: 1,
                size: 1,
                customFilters: '',
                search: JSON.stringify({ name: 'John', age: 30 }),
                projection: ''
            };
            const expectedCondition = {
                $and: [{
                    $or: [
                        { name: { $regex: /John/i } },
                        { age: { $regex: /30/i } }
                    ]
                }, {}]
            };
            const result = await service.findAll(rootCondition, query);
        });
    })

    describe('findOne', () => {
        it('should return success if workflow found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(processInstanceMock);
            const response = await service.findOne('kalyani');
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS,);
            // expect(response).toBe(expectedResponse);
        })
        it('should return error object if workflow not found', async () => {
            jest.spyOn(processInstanceRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.findOne('')).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND),
            );
        })
    })

    describe('getStatsByDefinitionId', () => {
        it('should call getStatsByDefinitionId', async () => {
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(service, 'getStats').mockResolvedValueOnce(expectedResponse);
            expect(await service.getStatsByDefinitionId('', getProcessInstanceStatsQueryDto)).toBe(expectedResponse);
        })
    })

    describe('getStatsByDefinitionKey', () => {
        it('should call getStatsByDefinitionKey', async () => {
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(service, 'getStats').mockResolvedValueOnce(expectedResponse);
            expect(await service.getStatsByDefinitionKey('', getProcessInstanceQueryDto)).toBe(expectedResponse);
        })
    })

    describe('getStats', () => {
        it('getStats should return stats for valid inputs', async () => {
            const groupBy = 'someField';
            const _condition = { someField: 'someValue' };
            const query = {
                filters: JSON.stringify({ someFilter: 'someValue' }),
                customFilters: JSON.stringify({ startDate: '2022-11-07', endDate: '2022-11-07' }),
                search: JSON.stringify({ someSearch: 'someValue' })
            };
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
                                    $gte: new Date('2022-11-07T00:00:00.000Z'),
                                    $lt: new Date('2022-11-09T23:59:59.999Z')
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
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return { startDate: '2022-11-07', endDate: '2022-11-07' };
            });

            jest.spyOn(processInstanceRepository, 'aggregate').mockResolvedValue([
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
            const result = await service.getStats(groupBy, _condition, query);
            expect(result).toEqual(expectedResult);
            expect(JSON.parse).toHaveBeenCalledTimes(3);
        });
    })

    describe('runByDefinitionId', () => {
        it('should throw error if workflow not found', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.runByDefinitionId(headers, '', startProcessInstanceBodyDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should throw error if workflow not found when the call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.runByDefinitionId(headers, '', startProcessInstanceBodyDto, true)).rejects.toThrowError(
                new CustomRpcException(3, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should throw error if isValid or workflow._compiledDefinition does not exist', async () => {

            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = ''
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([false, error]);
            await expect(service.runByDefinitionId(headers, '', startProcessInstanceBodyDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition'),
            );
        })

        it('should execute successfully and return success response', async () => {


            processDefinitionMock._compiledDefinition = {
                stages: [],
            }
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(service, 'runFlow').mockImplementation()
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = '';
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, error]);
            const expectedResponse = new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            const response = await service.runByDefinitionId(headers, '', startProcessInstanceBodyDto, false);
            expect(response).toBeInstanceOf(CustomResponse);
        })

        it('should execute successfully and return success response when the call is grpc', async () => {
            processDefinitionMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: false,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            processDefinitionMock._compiledDefinition = {
                stages: [],
            }
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(service, 'runFlow').mockImplementation()
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = '';
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, error]);
            const expectedResponse = new CustomGrpcResponse(0, CustomMessages.PROCESS_INSTANCE_RUNNING, {});
            const response = await service.runByDefinitionId(headers, '', startProcessInstanceBodyDto, true);
            // expect(response).toBe(expectedResponse);
        })
    })

    describe('runByDefinitionKey', () => {
        it('should throw error if workflow not found', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.runByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', startProcessInstanceBodyDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should throw error if workflow not found when call is grpc', async () => {
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.runByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', startProcessInstanceBodyDto, true)).rejects.toThrowError(
                new CustomRpcException(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS),
            );
        })

        it('should throw error if isValid or workflow._compiledDefinition does not exist', async () => {
            processDefinitionMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: false,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = ''
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([false, error]);
            await expect(service.runByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', startProcessInstanceBodyDto, false)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, error || 'Error in process definition'),
            );

        })

        it('should execute successfully and return success response', async () => {
            processDefinitionMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: false,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            processDefinitionMock._compiledDefinition = {
                stages: [],
            }
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(service, 'runFlow').mockImplementation()
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = '';
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, error]);
            const expectedResponse = new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            const response = await service.runByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', startProcessInstanceBodyDto, false);
            expect(response).toBeInstanceOf(CustomResponse);
        })

        it('should execute successfully and return success response when call is grpc', async () => {
            processDefinitionMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: false,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ]

            processDefinitionMock._compiledDefinition = {
                stages: [],
            }
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            jest.spyOn(service, 'runFlow').mockImplementation()
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            }
            const error = '';
            jest.spyOn(executer, 'validateParameters').mockReturnValueOnce([true, error]);
            const expectedResponse = new CustomGrpcResponse(0, CustomMessages.PROCESS_INSTANCE_RUNNING);
            const response = await service.runByDefinitionKey(headers, getOneProcessInstanceQueryDto, '', startProcessInstanceBodyDto, true);
            // expect(response).toBeInstanceOf(CustomResponse);
        })
    })

    describe('runFlow', () => {
        it('should execute the function suceessfully', async () => {
            processDefinitionMock._compiledDefinition = {
                _id: '',
                rootProcessInstanceId: '',
                timeActivated: 0,
                timeStarted: 0,
                _startIndex: 0,
                stages: [
                    {
                        timeActivated: 0
                    }
                ]
            }
            processDefinitionMock.properties = [
                {
                    key: '',
                    section: '',
                    value: {
                        type: '',
                        arrayOf: '',
                        default: '',
                        required: false,
                        enum: [''],
                        properties: [''],
                        displayType: ''
                    }
                }
            ];
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
            startProcessInstanceBodyDto.parameters = {
                name: 'kalyani'
            };
            jest.spyOn(processInstanceRepository, 'create').mockResolvedValueOnce(processInstanceMock);
            jest.spyOn(executer, 'startFlow').mockImplementation();
            const result = await service.runFlow(processDefinitionMock, '', startProcessInstanceBodyDto);
            expect(result).not.toBeInstanceOf(CustomError);
        })
    })

    describe('getStageStats', () => {
        it('should return stage stats for a valid process definition', async () => {
            const query = {
                processDefinitionId: '123',
            };
            const workflowData = {
                _id: '123',
                key: 'workflowKey',
                version: 1,
                stages: [
                    { key: 'stage1', name: 'Stage 1' },
                    { key: 'stage2', name: 'Stage 2' },
                ],
            };
            const stageStatsData = [
                {
                    _id: 'stage1',
                    waiting_count: 1,
                    started_count: 2,
                    active_count: 3,
                    completed_count: 4,
                    error_count: 0,
                },
                {
                    _id: 'stage2',
                    waiting_count: 0,
                    started_count: 1,
                    active_count: 0,
                    completed_count: 2,
                    error_count: 1,
                },
            ];
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(workflowData as any);
            jest.spyOn(processInstanceRepository, 'aggregate').mockResolvedValueOnce(stageStatsData);
            const expectedWorkflow = {
                ...workflowData,
                stages: [
                    {
                        key: 'stage1',
                        name: 'Stage 1',
                        count: {
                            waiting_count: 1,
                            started_count: 2,
                            active_count: 3,
                            completed_count: 4,
                            error_count: 0,
                        },
                    },
                    {
                        key: 'stage2',
                        name: 'Stage 2',
                        count: {
                            waiting_count: 0,
                            started_count: 1,
                            active_count: 0,
                            completed_count: 2,
                            error_count: 1,
                        },
                    },
                ],
            };
            jest.spyOn(JSON, 'parse').mockImplementation(() => {
                return expectedWorkflow;
            });
            const response = await service.getStageStats(query);
            expect(response).toEqual(new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, expectedWorkflow));
        });


        it('should return an error for an invalid process definition', async () => {
            const query = { processDefinitionId: 'invalidId' };
            jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(service.getStageStats(query)).rejects.toThrowError(
                new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_EXISTS)
            );
        });
    });

    describe('sortWorkflow', () => {
        it('should sort the workflow correctly', () => {
            const keyWithNextKeyTwo = [
                { key: 'start', subType: 'start', type: 'start', status: 'completed', nextStages: ['gateway1'] },
                { key: 'gateway1', subType: 'gateway', type: 'gateway', status: 'completed', nextStages: ['task1'] },
                { key: 'task1', subType: 'task', type: 'activity', status: 'completed', nextStages: ['gateway2'] },
                { key: 'gateway2', subType: 'gateway', type: 'gateway', status: 'completed', nextStages: ['task2'] },
                { key: 'task2', subType: 'task', type: 'activity', status: 'completed', nextStages: ['end'] },
                { key: 'end', subType: 'end', type: 'end', status: 'completed' },
            ];
            service.sortWorkflow(keyWithNextKeyTwo);
        });

        it('should throw an error if starting stage not found', () => {
            const keyWithNextKeyTwo = [
                { key: 'gateway1', subType: 'gateway', type: 'gateway', status: 'completed', onTrueNextStage: 'task1' },
                { key: 'task1', subType: 'task', type: 'task', status: 'completed', nextStages: ['gateway2'] },
            ];
            expect(() => service.sortWorkflow(keyWithNextKeyTwo)).toThrow('Starting stage not found');
        });
    });

    describe('helperConverter', () => {
        it('should correctly convert an array of elements', () => {
            const inputElements = [
                {
                    key: 'start',
                    name: 'Start',
                    type: 'start',
                    nextStages: ['gateway1'],
                    subType: 'start',
                    status: 'completed',
                    conditions: [{ onTrueNextStage: 'gateway1' }]
                },
                {
                    key: 'gateway1',
                    name: 'Gateway 1',
                    type: 'gateway',
                    nextStages: ['task1'],
                    subType: 'gateway',
                    status: 'completed',
                    conditions: [{ onTrueNextStage: 'task1' }]
                },
            ];
            const result = service.helperConverter(inputElements);
            const expectedOutput = [
                {
                    key: 'start',
                    name: 'Start',
                    type: 'start',
                    nextStages: ['gateway1'],
                    subType: 'start',
                    status: 'completed',
                    onTrueNextStage: 'gateway1'
                },
                {
                    key: 'gateway1',
                    name: 'Gateway 1',
                    type: 'gateway',
                    nextStages: ['task1'],
                    subType: 'gateway',
                    status: 'completed',
                    onTrueNextStage: 'task1'
                },
            ];
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('keepNameofStages', () => {
        it('should correctly keep the name of stages from sorted process instances stages', () => {
            const sortedProcessInstancesStages = [
                { key: 'start', name: 'Start' },
                { key: 'task1', name: 'Task 1' },
                { key: 'gateway1', name: 'Gateway 1' },
            ];

            const result = service.keepNameofStages(sortedProcessInstancesStages);
            const expectedOutput = ['start', 'task1', 'gateway1'];
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('getInstancesByDefinitionIdPathFinder', () => {
        it('should return instances with stages for a given process definition ID', async () => {
            const processDefinitionId = 'kalyani';
            const mockInstances = [
                {
                    stages: [
                        { key: 'start', name: 'Start' },
                        { key: 'task1', name: 'Task 1' },
                    ],
                },
            ];
            jest.spyOn(service, 'findInstancesForPath').mockResolvedValue(mockInstances);
            const result = await service.getInstancesByDefinitionIdPathFinder(processDefinitionId);
            const expectedOutput = [
                [
                    { key: 'start', name: 'Start' },
                    { key: 'task1', name: 'Task 1' },
                ],
            ];
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('findInstancesForPath', () => {
        it('should find instances based on the root condition', async () => {
            const rootCondition = { processDefinitionId: 'kalyani' };
            const mockInstances = [
                { _id: 'instance1', someProperty: 'value1' },
                { _id: 'instance2', someProperty: 'value2' },
            ];
            jest.spyOn(processInstanceRepository, 'find').mockResolvedValue(mockInstances as any);
            const result = await service.findInstancesForPath(rootCondition);
            const expectedOutput = [
                { _id: 'instance1', someProperty: 'value1' },
                { _id: 'instance2', someProperty: 'value2' },
            ];
            expect(result).toEqual(expectedOutput);
        });
    });

    describe('mostFollowedPath', () => {
        it('should find the most followed path for a process definition', async () => {
            jest.spyOn(service, 'getInstancesByDefinitionIdPathFinder').mockResolvedValue([
                [
                    { key: 'start', name: 'Start', type: 'start', nextStages: ['A'], subType: 'start', status: 'completed' },
                    { key: 'A', name: 'Stage A', type: 'activity', nextStages: ['B', 'C'], subType: 'task', status: 'completed' },
                    { key: 'B', name: 'Stage B', type: 'activity', nextStages: ['D'], subType: 'task', status: 'completed' },
                    { key: 'C', name: 'Stage C', type: 'activity', nextStages: ['D'], subType: 'task', status: 'completed' },
                    { key: 'D', name: 'Stage D', type: 'activity', nextStages: ['E'], subType: 'task', status: 'completed' },
                    { key: 'E', name: 'End', type: 'end', nextStages: [], subType: 'end', status: 'completed' },
                ]
            ]);
            jest.spyOn(service, 'helperConverter').mockImplementation((stages) => { return stages; });
            jest.spyOn(service, 'sortWorkflow').mockImplementation((stages) => { return stages; });
            jest.spyOn(service, 'keepNameofStages').mockImplementation((stages) => { return stages.map((stage) => stage.name); });
            const expectedResult = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, {
                mostFollowedPath: 'Start > Stage A > Stage B > Stage C > Stage D > End',
            });
            const result = await service.mostFollowedPath('kalyani');
            expect(result).toEqual(expectedResult);
        });
    });

})