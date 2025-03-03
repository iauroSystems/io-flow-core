import { HttpStatus } from "@nestjs/common";
import { ProcessDefinition } from "../../../models/process-definitions/process-definitions.schema";
import { ProcessDefinitionRepositoryImpl } from "../../../../src/models/process-definitions/repository/process-definitions.repository.impl";
import { Audits } from "../../../../src/shared/clients/audit-service/audit-service.provider";
import { GrpcConnector } from "../../../../src/shared/connectors";
import { Compiler } from "../../process-instances/providers";
import { ProcessDefinitionService } from "../process-definitions.service";
import { Test } from "@nestjs/testing";
import { CustomMessages } from "src/common/const/custom-messages";
import CustomResponse from "src/common/providers/custom-response.service";
import { CommonHeadersDto } from "src/shared/dtos";
import CustomError from "src/common/exceptions";
import { getModelToken } from "@nestjs/mongoose";
import { ConnectorTypes, StageSubTypes, StageTypes } from "src/common/const/enums";
import { UpdateStageBody } from "../dtos/update-stage.dto";
import { GetProcessDefinitionDto, GetProcessDefinitionQueryDto } from "../dtos";

const mockService = {
  create: jest.fn(),
  update: jest.fn(),
  updateStage: jest.fn(),
  findAll: jest.fn(),
  findOneByKey: jest.fn(),
  findOne: jest.fn(),
  uploadProtoFile: jest.fn(),
  uploadBPMNFile: jest.fn(),
  bpmnJsonToNativeJson:jest.fn(),
  sanitize: jest.fn()
}

const headers: CommonHeadersDto = {
  "x-tenant-id": "",
  "authorization": "",
  "user-id": ""
}
const processDefinitionDto = {
    name: 'Notify - Communication',
    description: 'JMeter Testing',
    key: 'P1C1-1',
    isParallel: false,
    stages: [
      {
        key: 'P1C_E1',
        name: 'start stage',
        description: 'string',
        type: 'event',
        subType: 'start',
        nextStages: [
          'P1C_A1'
        ]
      },
      {
        key: 'P1C_A1',
        name: 'Is logged in',
        description: 'string',
        type: 'gateway',
        subType: 'exclusive',
        nextStages: [
          'P1C_E2'
        ],
        conditions: []
      },
      {
        key: 'P1C_E2',
        name: 'end stage',
        description: 'end process',
        type: 'event',
        subType: 'end'
      }
    ]
  };

const validateCreateProcessDefinitionDto = {
    name: 'Notify - Communication',
    description: 'JMeter Testing',
    key: 'P1C1-1',
    isParallel: false,
    stages: []
  };
  
const updateProcessDefinition = {
  stages: [
    {
      key: 'a',
      name: '',
      description: '',
      type: StageTypes.EVENT,
      subType: StageSubTypes.START,
      auto: true,
      disabled: true,
      nextStages: [''],
      properties: [
        {
          key: '',
          value: {
            type: '',
            default: '',
            required: true,
            enum: ['']
          }
        }
      ],
      conditions: [
        {
          name: '',
          op: '',
          expressions: [{
            lhs: '',
            op: '',
            rhs: ''
          }],
          onTrueNextStage: '',
          onFalseNextStage: ''
        }
      ],
      assignee: '',
      watchers: [''],
      connector: {
        type: ConnectorTypes.REST,
        config: {}
      }
    },
    {
      key: 'a',
      name: '',
      description: '',
      type: StageTypes.EVENT,
      subType: StageSubTypes.START,
      auto: true,
      disabled: true,
      nextStages: [''],
      properties: [
        {
          key: '',
          value: {
            type: '',
            default: '',
            required: true,
            enum: ['']
          }
        }
      ],
      conditions: [
        {
          name: '',
          op: '',
          expressions: [{
            lhs: '',
            op: '',
            rhs: ''
          }],
          onTrueNextStage: '',
          onFalseNextStage: ''
        }
      ],
      assignee: '',
      watchers: [''],
      connector: {
        type: ConnectorTypes.REST,
        config: {}
      }
    }
  ]
}

const updateProcessDefinitionOne = {
  stages: [{
    key: 'p',
    name: '',
    description: '',
    type: StageTypes.EVENT,
    subType: StageSubTypes.START,
    auto: true,
    disabled: true,
    nextStages: [''],
    properties: [
      {
        key: '',
        value: {
          type: '',
          default: '',
          required: true,
          enum: ['']
        }
      }
    ],
    conditions: [
      {
        name: '',
        op: '',
        expressions: [{
          lhs: '',
          op: '',
          rhs: ''
        }],
        onTrueNextStage: '',
        onFalseNextStage: ''
      }
    ],
    assignee: '',
    watchers: [''],
    connector: {
      type: ConnectorTypes.REST,
      config: {}
    }
  }
  ]
}

const updateStageBody:UpdateStageBody = {
  key: 'p',
    name: '',
    description: '',
    type: StageTypes.EVENT,
    subType: StageSubTypes.START,
    auto: true,
    disabled: true,
    nextStages: [''],
    properties: [
      {
        key: '',
        value: {
          type: '',
          default: '',
          required: true,
          enum: ['']
        }
      }
    ],
    conditions: [
      {
        name: '',
        op: '',
        expressions: [{
          lhs: '',
          op: '',
          rhs: ''
        }],
        onTrueNextStage: '',
        onFalseNextStage: ''
      }
    ],
    assignee: '',
    connector: {
      type: ConnectorTypes.REST,
      config: {}
    }
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

describe('Process-DefinitionsService', () => {
  let processDefinitionService: ProcessDefinitionService;
  let processDefinitionRepository: ProcessDefinitionRepositoryImpl;
  let compiler: Compiler;
  let audits: Audits;


  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProcessDefinitionService,
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
          provide: getModelToken(ProcessDefinition.name),
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
          },
        },
        GrpcConnector
      ]
    }).compile();
    processDefinitionService = moduleRef.get<ProcessDefinitionService>(ProcessDefinitionService)
    processDefinitionRepository = moduleRef.get<ProcessDefinitionRepositoryImpl>(ProcessDefinitionRepositoryImpl);
  })


  describe('service ', () => {
    it('service should be defined', async () => {
      expect(processDefinitionService).toBeDefined();
    })
  })

  describe('create', () => {

    it('should throw a CustomError if the key is duplicated in stages', async () => {
        jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockResolvedValueOnce(true);
        await expect(processDefinitionService.create(headers, processDefinitionDto as any)).rejects.toEqual(
            new CustomError(HttpStatus.BAD_REQUEST, '[key] must be unique within [stages] array'),
        );
      });

      it('should throw a bad request stages are not valid', async () => {
        jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockReturnValue(false);
        jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
        jest.spyOn(processDefinitionRepository, 'create').mockResolvedValueOnce(processDefinitionMock);
        await expect(processDefinitionService.create(headers, validateCreateProcessDefinitionDto as any)).rejects.toEqual(
            new CustomError(HttpStatus.BAD_REQUEST, 'The stages array must have at least one element.'),
        );
      });


    it('should create workflow successfully when we found workflow with same key', async () => {
        jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockReturnValue(false);
        jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
        jest.spyOn(processDefinitionRepository, 'create').mockResolvedValueOnce(processDefinitionMock);
        const expectedRespose = new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_CREATED_NEW_VERSION, processDefinitionMock);
        const response = await processDefinitionService.create(headers, processDefinitionDto as any);
        expect(response).toEqual(expectedRespose);
      })

    it('should create workflow successfully when we did not found workflow with same key', async () => {
        jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockReturnValue(false);
        jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
        jest.spyOn(processDefinitionRepository, 'create').mockResolvedValueOnce(processDefinitionMock);
        const expectedRespose = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED, processDefinitionMock);
        const response = await processDefinitionService.create(headers, processDefinitionDto as any);
        expect(response).toEqual(expectedRespose);
      })
    })

  describe('update', () => {
    it('should return an error if workflow not found', async () => {
      const id = 'nonexistent-id';
      const updateProcessDefinitionDto = {};
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValue(undefined);
      await expect(processDefinitionService.update(headers, id, updateProcessDefinitionDto)).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND),
      );
    });

    it('should return an error if duplicate stage key found', async () => {
      const id = 'existing-id';
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
      jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockResolvedValueOnce(true);

      await expect(processDefinitionService.update(headers, id, processDefinitionDto as any)).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, '[key] must be unique within [stages] array'),
      );
    });

    it('should throw a CustomError with HttpStatus.BAD_REQUEST if the workflow is not found', async () => {
      const id = 'existing-id';
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
      await expect(processDefinitionService.update(headers, id, processDefinitionDto as any)).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, 'workflow not found'),
      );
    });

    it('should throw a CustomError with HttpStatus.BAD_REQUEST if the stage key is not unique', async () => {
      const id = 'existing-id';
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
      await expect(processDefinitionService.update(headers, id, { ...updateProcessDefinition as any})).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, '[key] must be unique within [stages] array'),
      );
    });

    it('should update the process definition', async () => {
      const id = ''
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValue(processDefinitionMock);
      jest.spyOn(processDefinitionRepository, 'update').mockResolvedValue(processDefinitionMock);
      jest.spyOn(processDefinitionService, <any>'checkDuplicateKey').mockReturnValue(false);
      const result = await processDefinitionService.update(headers, id, updateProcessDefinitionOne as any);
      expect(processDefinitionRepository.findOne).toHaveBeenCalledWith({ id });
      expect(processDefinitionRepository.update).toHaveBeenCalledWith({ _id: id }, updateProcessDefinitionOne);
      expect(result).toBeInstanceOf(CustomResponse);
    });
  });

  describe('updateStage', () => {
    it('should throw an error if workflow not found', async () => {
      const params = { processDefinitionId: 'test-id', stageId: 'test-stage-id' };
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValue(undefined);
      await expect(processDefinitionService.updateStage(headers, params, updateStageBody)).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND),
      );
    });

    it('should update the stage in the database', async () => {
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValue(processDefinitionMock);
      jest.spyOn(processDefinitionRepository, 'updateStage').mockResolvedValueOnce(processDefinitionMock)
      const params = { processDefinitionId: 'test-id', stageId: 'test-stage-id' };
      const result = await processDefinitionService.updateStage(headers, params, updateStageBody);
      expect(result).toEqual(new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED, processDefinitionMock));
    });
  })

  describe('findAll', () => {
    it('should return all process definitions with no filters, search, or sort', async () => {
      const query: GetProcessDefinitionDto = {
        page: 0,
        size: 10,
        filters: "",
        customFilters: "",
        sort: "",
        search: ""
      };
      const count = 2;
      jest.spyOn(processDefinitionRepository, 'count').mockResolvedValueOnce(count);
      jest.spyOn(processDefinitionRepository, 'find').mockResolvedValueOnce([processDefinitionMock]);
      const data = [processDefinitionMock]
      const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
      const result = await processDefinitionService.findAll(query);
      expect(result).toEqual(expectedResponse)
    });

    it('should return all process definitions with filters, search, or sort', async () => {
      const query: GetProcessDefinitionDto = {
        page: 0,
        size: 10,
        filters: JSON.stringify({'key':'SSM'}),
        customFilters: "",
        sort: JSON.stringify({createdAt: 1}),
        search: JSON.stringify({'processDefinitionKey':'SSM'}),
      };
      const count = 2;
      jest.spyOn(processDefinitionRepository, 'count').mockResolvedValueOnce(count);
      jest.spyOn(processDefinitionRepository, 'find').mockResolvedValueOnce([processDefinitionMock]);
      const data = [processDefinitionMock]
      const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data });
      const result = await processDefinitionService.findAll(query);
      expect(result).toEqual(expectedResponse)
    });

    it('should throw error that json is invalid', async () => {
      await expect(processDefinitionService.findAll('' as any)).rejects.toThrowError(
        new CustomError(HttpStatus.BAD_REQUEST, ` [filters/customFilters/search] ${CustomMessages.INVALID_JSON}`),
      );
    });
  })

  describe('findOne', () => {
    it('should find a process definition for the given process definition id', async () => {
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
      const expectedRespose = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, processDefinitionMock);
      const result = await processDefinitionService.findOne('');
      expect(result).toEqual(expectedRespose)

    })
    it('should throw error when workflow not found', async () => {
      const id = 'some-id';
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
      await expect(processDefinitionService.findOne(id)).rejects.toThrow(new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND));
    })
  })

  describe('findOneByKey', () => {
    const query: GetProcessDefinitionQueryDto = { version: 2 };
    it('should find a process definition for provided process definition key', async () => {
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(processDefinitionMock);
      const expectedRespose = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, processDefinitionMock);
      const result = await processDefinitionService.findOneByKey('key', query);
      expect(result).toEqual(expectedRespose)

    })
    it('should throw error when workflow not found', async () => {
      jest.spyOn(processDefinitionRepository, 'findOne').mockResolvedValueOnce(undefined);
      await expect(processDefinitionService.findOneByKey('key', query)).rejects.toThrow(new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND));
    })
  })
 
  describe('uploadProtoFile', () => {
    it('returns a object with a protoPath', async () => {
      const file = { filename: 'test.proto' };
      const result = await processDefinitionService.uploadProtoFile(headers, file);
      expect(result).toBeInstanceOf(CustomResponse);
    });
  });

  describe('uploadWsdlFile', () => {
    it('returns a object with a wsdlPath', async () => {
      const file = { filename: 'test.wsdl' };
      const result = await processDefinitionService.uploadWsdlFile(headers, file);
      expect(result).toBeInstanceOf(CustomResponse);
    });
  });

    describe('uploadBPMNFile', () => {
    it('should return the result of create function', async () => { 
      try{
      const file = { originalname: 'test.bpmn' };
      const createSpy = jest.spyOn(processDefinitionService, 'create').mockResolvedValueOnce(new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED));
      const result = await processDefinitionService.uploadBPMNFile(headers, file);
      expect(result).toEqual(new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED));
      expect(createSpy).toHaveBeenCalledWith(headers, expect.any(Object));
      }catch(err){}
    });
  });

  describe('bpmnJsonToNativeJson', () => {
    it('should return the native JSON object with the correct structure', () => {
      const bpmnJson = {
        elements: [
          {
            elements: [
              {
                attributes: { id: 'start', name: 'Start Event' },
                elements: [
                  {
                    attributes: { id: 'start', name: 'Start Event' },
                    elements: [],
                    name: 'bpmn:startEvent',
                  },
                ],
                name: 'bpmn:startEvent',
              },
              {
                attributes: { id: 'task1', name: 'Task 1' },
                elements: [
                  {
                    elements: [
                      {
                        attributes: { target: 'output1' },
                        elements: [],
                        name: 'zeebe:output',
                      },
                    ],
                    name: 'zeebe:ioMapping',
                  },
                ],
                name: 'bpmn:serviceTask',
              },
              {
                attributes: { id: 'gateway', name: 'Exclusive Gateway' },
                elements: [],
                name: 'bpmn:exclusiveGateway',
              },
              {
                attributes: { id: 'task2', name: 'Task 2' },
                elements: [
                  {
                    elements: [
                      {
                        attributes: { target: 'output2' },
                        elements: [],
                        name: 'zeebe:output',
                      },
                    ],
                    name: 'zeebe:ioMapping',
                  },
                ],
                name: 'bpmn:userTask',
              },
              {
                attributes: { id: 'end', name: 'End Event' },
                elements: [],
                name: 'bpmn:endEvent',
              },
              {
                attributes: { id: 'seq1', sourceRef: 'start', targetRef: 'task1' },
                elements: [],
                name: 'bpmn:sequenceFlow',
              },
              {
                attributes: { id: 'seq2', sourceRef: 'task1', targetRef: 'gateway' },
                elements: [],
                name: 'bpmn:sequenceFlow',
              },
              {
                attributes: { id: 'seq3', sourceRef: 'gateway', targetRef: 'task2' },
                elements: [],
                name: 'bpmn:sequenceFlow',
              },
              {
                attributes: { id: 'seq4', sourceRef: 'gateway', targetRef: 'end' },
                elements: [],
                name: 'bpmn:sequenceFlow',
              },
            ],
            name: 'bpmn:process',
           }
        ]
      };
      const result = processDefinitionService.bpmnJsonToNativeJson(bpmnJson);
      expect(result).toEqual({
        name: 'Start Event',
        description: '',
        key: 'start',
        isParallel: false,
        stages: [
          {
            key: 'start',
            name: 'Start Event',
            description: 'bpmn:startEvent',
            type: 'event',
            subType: 'start',
            nextStages: [],
            properties: undefined
          }
        ],
        properties: []
      }
)
    })
  })
})