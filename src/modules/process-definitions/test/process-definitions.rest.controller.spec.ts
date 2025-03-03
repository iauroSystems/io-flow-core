import { HttpStatus } from "@nestjs/common";
import CustomResponse from '../../../common/providers/custom-response.service';
import { CreateProcessDefinitionDto, UpdateProcessDefinitionDto, GetProcessDefinitionDto, UpdateDefinitionParams, StageDefinition, GetProcessDefinitionQueryDto } from "../dtos";
import { ProcessDefinitionService } from "../process-definitions.service";
import { UpdateStageBody, UpdateStageParams } from "../dtos/update-stage.dto";
import { CommonHeadersDto } from "../../../shared/dtos";
import { ProcessDefinitionController } from "../process-definitions.rest.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomMessages } from "src/common/const/custom-messages";
import { Readable } from "stream";

let mockProcessDefinitionService={
    create:jest.fn(),
    findAll:jest.fn(),  
    findOne: jest.fn(),
    findOneByKey:jest.fn(),
    update:jest.fn(),
    updateStage:jest.fn(),
    uploadProtoFile:jest.fn(),
    uploadWsdlFile: jest.fn(),
    uploadBPMNFile: jest.fn()
}

let headers:CommonHeadersDto={
    'x-tenant-id':'iauro',
    'authorization':'',
    'user-id':''
}

const createProcess=new CreateProcessDefinitionDto;
const getProcess=new GetProcessDefinitionDto;
const getProcessQuery=new GetProcessDefinitionQueryDto;
const updateProcess=new UpdateProcessDefinitionDto;
const updateStageParams=new UpdateStageParams;
const updateStage=new UpdateStageBody;


describe('Process-Definition Controller',()=>{
    let processDefinitionController:ProcessDefinitionController;
    let processDefinitionService:ProcessDefinitionService;
    beforeEach(async ()=>{
        const module:TestingModule=await Test.createTestingModule({
            controllers:[ProcessDefinitionController],
            providers:[
                {
                    provide:ProcessDefinitionService,
                    useValue:mockProcessDefinitionService
                }
            ]
        }).compile();
        processDefinitionController=module.get<ProcessDefinitionController>(ProcessDefinitionController);
        processDefinitionService=module.get<ProcessDefinitionService>(ProcessDefinitionService)
    })

    it('should be defined',()=>{
        expect(processDefinitionController).toBeDefined();
    })

    describe('create',()=>{
        it('should create process definition',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'create').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.create(headers,createProcess)).toBe(response);
        })
    })

    describe('findAll',()=>{
        it('should list all process definitions',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'findAll').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.findAll(headers, getProcess)).toBe(response);
        })
    })

    describe('findOne',()=>{
        it('should return process definition of provided process definition id',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'findOne').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.findOne(headers, '652e8bda07940cd14392f02a')).toBe(response);
        })
    })

    describe('findOneByKey',()=>{
        it('should return process definition of provided process definition key',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'findOneByKey').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.findOneByKey(headers, 'SSM', getProcessQuery )).toBe(response);
        })
    })

    describe('updateOne',()=>{
        it('should update process definition of provided process definition id',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'update').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.updateOne(headers, '652e8bda07940cd14392f02a', updateProcess )).toBe(response);
        })
    })

    describe('updateStage',()=>{
        it('should update stage of process definition of provided process definition',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'updateStage').mockImplementation(() => Promise.resolve(response));
            expect(await processDefinitionController.updateStage(headers, updateStageParams, updateStage )).toBe(response);
        })
    })

    describe('uploadPROTOFile',()=>{
        it('should upload proto file',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'uploadProtoFile').mockImplementation(() => Promise.resolve(response));
            const file: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'test.proto',
                encoding: '7bit',
                mimetype: 'application/octet-stream',
                destination: '../../../proto/access-control',
                filename: 'test.proto',
                path: '../../../proto/access-control/access-control.proto',
                size: 1234,
                buffer: Buffer.from([]),
                stream: Readable.from([])
            };
              
            expect(await processDefinitionController.uploadPROTOFile(headers, file)).toBe(response);
        })
    })

    describe('uploadWSDLFile',()=>{
        it('should upload wsdl file',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'uploadWsdlFile').mockImplementation(() => Promise.resolve(response));
            const file: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'test.wsdl',
                encoding: '7bit',
                mimetype: 'application/octet-stream',
                destination: '../../../proto/access-control',
                filename: 'test.wsdl',
                path: '../../../proto/access-control/access-control.proto',
                size: 1234,
                buffer: Buffer.from([]),
                stream: Readable.from([])
            };
              
            expect(await processDefinitionController.uploadWSDLFile(headers, file)).toBe(response);
        })
    })

    describe('uploadBPMNFile',()=>{
        it('should upload bpmn file',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(processDefinitionService,'uploadBPMNFile').mockImplementation(() => Promise.resolve(response));
            const file: Express.Multer.File = {
                fieldname: 'file',
                originalname: 'test.bpmn',
                encoding: '7bit',
                mimetype: 'application/octet-stream',
                destination: '../../../proto/access-control',
                filename: 'test.bpmn',
                path: '../../../proto/access-control/access-control.proto',
                size: 1234,
                buffer: Buffer.from([]),
                stream: Readable.from([])
            };
              
            expect(await processDefinitionController.uploadBPMNFile(headers, file)).toBe(response);
        })
    })
})

