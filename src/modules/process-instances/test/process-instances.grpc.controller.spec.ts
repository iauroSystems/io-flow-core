import {HttpStatus} from '@nestjs/common';
import CustomResponse from '../../../../src/common/providers/custom-response.service';
import { CreateProcessInstanceDto, GetProcessInstanceStatsQueryDto, GetProcessInstanceQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceDto, UpdateProcessInstanceQueryDto, GetProcessInstanceStageStatsQueryDto } from '../dtos';
import { ProcessInstanceService } from '../process-instances.service';
import { CommonHeadersDto } from '../../../../src/shared/dtos';
import { ProcessInstanceGrpcController } from '../process-instances.grpc.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomMessages } from 'src/common/const/custom-messages';
import { Metadata } from '@grpc/grpc-js';

const mockExtractHeaders ={
    'x-tenant-id':'iauro',
    'authorization':'x',
    'user-id':''
}

let mockProcessInstanceService={
    createByDefinitionId:jest.fn(),
    createByDefinitionKey:jest.fn(),
    start:jest.fn(),
    runByDefinitionId:jest.fn(),
    runByDefinitionKey:jest.fn(),
    runFlow:jest.fn(),
    getInstancesByDefinitionId:jest.fn()

}

const data: any = {
    processDefinitionId: '',
    query: {},
    processInstanceId: '',
    createProcessInstanceDto: {},
    parameters: JSON.stringify({ fName: 'Kalyani', lName: 'Amrutkar' })
  };

  
const getOneProcessInstanceQueryDto=new GetOneProcessInstanceQueryDto;
const createProcessInstanceDto=new CreateProcessInstanceDto;
const getProcessInstanceDto=new GetProcessInstanceQueryDto;
const getProcessInstanceStatsQueryDto=new GetProcessInstanceStatsQueryDto;
const updateProcessInstanceDto=new UpdateProcessInstanceDto;
const updateProcessInstanceQueryDto=new UpdateProcessInstanceQueryDto;
const getProcessInstanceStageStatsQueryDto=new GetProcessInstanceStageStatsQueryDto;
describe('Process-instance Controller',()=>{
    let processInstanceGrpcController:ProcessInstanceGrpcController;
    let processInstanceService:ProcessInstanceService;
    beforeEach(async()=>{
        const module:TestingModule=await Test.createTestingModule({
            controllers:[ProcessInstanceGrpcController],
            providers:[
                {
                    provide:ProcessInstanceService,
                    useValue:mockProcessInstanceService
                }
            ]
        }).compile();
        processInstanceGrpcController=module.get<ProcessInstanceGrpcController>(ProcessInstanceGrpcController);
        processInstanceService=module.get<ProcessInstanceService>(ProcessInstanceService);
    })
    it('should be defined',()=>{
        expect(processInstanceGrpcController).toBeDefined();
    })

    describe('createByDefinitionId',()=>{
        it('should call createByDefintionId',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED);
            jest.spyOn(processInstanceGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
            jest.spyOn(processInstanceService,'createByDefinitionId').mockImplementation(() => Promise.resolve(response));
            expect(await processInstanceGrpcController.createByDefinitionId(data, mockExtractHeaders)).toBe(response);
        })
    })

    describe('createByDefinitionKey',()=>{
        it('should call createByDefintionKey',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED);
            jest.spyOn(processInstanceGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
            jest.spyOn(processInstanceService,'createByDefinitionKey').mockImplementation(() => Promise.resolve(response));
            expect(await processInstanceGrpcController.createByDefinitionKey(data, mockExtractHeaders)).toBe(response);
        })
    })

    describe('start',()=>{
        it('should call start',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_STARTED);
            jest.spyOn(processInstanceGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
            jest.spyOn(processInstanceService,'start').mockImplementation(()=>Promise.resolve(response));
            expect(await processInstanceGrpcController.start(data)).toBe(response);
        })
    })

    describe('runByDefinitionId',()=>{
        it('should call runByDefinitionId',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            jest.spyOn(processInstanceGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
            jest.spyOn(processInstanceService,'runByDefinitionId').mockImplementation(()=>Promise.resolve(response));
            expect(await processInstanceGrpcController.runByDefinitionId(data, mockExtractHeaders)).toBe(response);
        })
    })

    describe('runByDefinitionKey',()=>{
        it('should call runByDefinitionKey',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            jest.spyOn(processInstanceGrpcController, <any>'extractHeaders').mockResolvedValue(mockExtractHeaders);
            jest.spyOn(processInstanceService,'runByDefinitionKey').mockImplementation(()=>Promise.resolve(response));
            expect(await processInstanceGrpcController.runByDefinitionKey(data, mockExtractHeaders)).toBe(response);
        })
    })
})  