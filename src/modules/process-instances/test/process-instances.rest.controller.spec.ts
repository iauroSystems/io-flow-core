import {HttpStatus} from '@nestjs/common';
import CustomResponse from '../../../../src/common/providers/custom-response.service';
import { CreateProcessInstanceDto, GetProcessInstanceStatsQueryDto, GetProcessInstanceQueryDto, GetOneProcessInstanceQueryDto, UpdateProcessInstanceDto, UpdateProcessInstanceQueryDto, GetProcessInstanceStageStatsQueryDto } from '../dtos';
import { ProcessInstanceService } from '../process-instances.service';
import { CommonHeadersDto } from '../../../../src/shared/dtos';
import { ProcessInstanceController } from '../process-instances.rest.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomMessages } from 'src/common/const/custom-messages';

let headers:CommonHeadersDto={
    'x-tenant-id':'iauro',
    'authorization':'',
    'user-id':''
}

let mockProcessInstanceService={
    createByDefinitionId:jest.fn(),
    createByDefinitionKey:jest.fn(),
    start:jest.fn(),
    updateInstances:jest.fn(),
    getInstancesByDefinitionKey:jest.fn(),
    findAll:jest.fn(),
    findOne:jest.fn(),
    getStatsByDefinitionId:jest.fn(),
    getStatsByDefinitionKey:jest.fn(),
    getStats:jest.fn(),
    runByDefinitionId:jest.fn(),
    runByDefinitionKey:jest.fn(),
    runFlow:jest.fn(),
    getInstancesByDefinitionId:jest.fn(),
    getStageStats:jest.fn(),
    mostFollowedPath:jest.fn()

}
const getOneProcessInstanceQueryDto=new GetOneProcessInstanceQueryDto;
const createProcessInstanceDto=new CreateProcessInstanceDto;
const getProcessInstanceDto=new GetProcessInstanceQueryDto;
const getProcessInstanceStatsQueryDto=new GetProcessInstanceStatsQueryDto;
const updateProcessInstanceDto=new UpdateProcessInstanceDto;
const updateProcessInstanceQueryDto=new UpdateProcessInstanceQueryDto;
const getProcessInstanceStageStatsQueryDto=new GetProcessInstanceStageStatsQueryDto;
describe('Process-instance Controller',()=>{
    let processInsatnceController:ProcessInstanceController;
    let processInsatnceService:ProcessInstanceService;
    beforeEach(async()=>{
        const module:TestingModule=await Test.createTestingModule({
            controllers:[ProcessInstanceController],
            providers:[
                {
                    provide:ProcessInstanceService,
                    useValue:mockProcessInstanceService
                }
            ]
        }).compile();
        processInsatnceController=module.get<ProcessInstanceController>(ProcessInstanceController);
        processInsatnceService=module.get<ProcessInstanceService>(ProcessInstanceService);
    })
    it('should be defined',()=>{
        expect(processInsatnceController).toBeDefined();
    })

    describe('createByDefinitionId',()=>{
        it('should call createByDefintionId',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED);
            jest.spyOn(processInsatnceService,'createByDefinitionId').mockImplementation(() => Promise.resolve(response));
            expect(await processInsatnceController.createByDefinitionId(headers,'', {version: 1})).toBe(response);
        })
    })

    describe('createByDefinitionKey',()=>{
        it('should call createByDefintionKey',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_CREATED);
            jest.spyOn(processInsatnceService,'createByDefinitionKey').mockImplementation(() => Promise.resolve(response));
            expect(await processInsatnceController.createByDefinitionKey(headers,'',getOneProcessInstanceQueryDto)).toBe(response);
        })
    })

    describe('start',()=>{
        it('should call start',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_STARTED);
            jest.spyOn(processInsatnceService,'start').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.start(headers,'',createProcessInstanceDto)).toBe(response);
        })
    })

    describe('findAll',()=>{
        it('should call findAll',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            const MockGetInstancesByDefinitionId=jest.fn();
            jest.spyOn(processInsatnceService,'getInstancesByDefinitionId').mockImplementation(MockGetInstancesByDefinitionId);
            MockGetInstancesByDefinitionId.mockReturnValue(response);
            const result=processInsatnceService.getInstancesByDefinitionId('',getProcessInstanceDto);
            expect(MockGetInstancesByDefinitionId).toHaveBeenCalled();
            expect(result).toBe(response);
            expect(await processInsatnceController.findAll(headers,'',getProcessInstanceDto)).toBe(response);  
        })
    })

    describe('findAllByKey',()=>{
        it('should call findAllByKey',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            const MockGetInstancesByDefinitionKey=jest.fn();
            jest.spyOn(processInsatnceService,'getInstancesByDefinitionKey').mockImplementation(MockGetInstancesByDefinitionKey);
            MockGetInstancesByDefinitionKey.mockReturnValue(response);
            const result=processInsatnceService.getInstancesByDefinitionKey('',getProcessInstanceDto);
            expect(MockGetInstancesByDefinitionKey).toHaveBeenCalled();
            expect(result).toBe(response);
            expect(await processInsatnceController.findAllByKey(headers,'',getProcessInstanceDto)).toBe(response);
        })
    })

    describe('findOne',()=>{
        it('should call findOne',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            jest.spyOn(processInsatnceService,'findOne').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.findOne(headers,'')).toBe(response);
        })
    })

    describe('getStatsByDefinitionId',()=>{
        it('should call getStatsByDefinitonId',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            const MockGetStatsByDefinitionId=jest.fn();
            jest.spyOn(processInsatnceService,'getStatsByDefinitionId').mockImplementation(MockGetStatsByDefinitionId);
            MockGetStatsByDefinitionId.mockReturnValue(response);
            const result=processInsatnceService.getStatsByDefinitionId('',getProcessInstanceStatsQueryDto);
            expect(await processInsatnceController.getStatsByDefinitionId(headers,'',getProcessInstanceStatsQueryDto)).toBe(response);
        })
    })

    describe('getStatsByDefinitionKey',()=>{
        it('should call getStatsByDefinitonKey',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS);
            const MockGetStatsByDefinitionKey=jest.fn();
            jest.spyOn(processInsatnceService,'getStatsByDefinitionKey').mockImplementation(MockGetStatsByDefinitionKey);
            MockGetStatsByDefinitionKey.mockReturnValue(response);
            const result=processInsatnceService.getStatsByDefinitionKey('',getProcessInstanceStatsQueryDto);
            expect(await processInsatnceController.getStatsByDefinitionKey(headers,'',getProcessInstanceStatsQueryDto)).toBe(response);
        })
    })

    describe('updateInstances',()=>{
        it('should call updateInstances',async()=>{
            const response=new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_UPDATED);
            jest.spyOn(processInsatnceService,'updateInstances').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.updateInstances(headers,'',updateProcessInstanceDto,updateProcessInstanceQueryDto)).toBe(response);
        })
    })

    describe('runByDefinitionId',()=>{
        it('should call runByDefinitionId',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            jest.spyOn(processInsatnceService,'runByDefinitionId').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.runByDefinitionId(headers,'',createProcessInstanceDto)).toBe(response);
        })
    })

    describe('runByDefinitionKey',()=>{
        it('should call runByDefinitionKey',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.PROCESS_INSTANCE_RUNNING);
            jest.spyOn(processInsatnceService,'runByDefinitionKey').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.runByDefinitionKey(headers,'',getOneProcessInstanceQueryDto,createProcessInstanceDto)).toBe(response);
        })
    })

    describe('getAllStageStats',()=>{
        it('should call getStageStats',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.SUCCESS);
            jest.spyOn(processInsatnceService,'getStageStats').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.getAllStageStats(headers, getProcessInstanceStageStatsQueryDto)).toBe(response);
        })
    })

    describe('mostFrequentPath',()=>{
        it('should call mostFrequentPath',async()=>{
            const response=new CustomResponse(HttpStatus.CREATED, CustomMessages.SUCCESS);
            jest.spyOn(processInsatnceService,'mostFollowedPath').mockImplementation(()=>Promise.resolve(response));
            expect(await processInsatnceController.mostFrequentPath(headers, '')).toBe(response);
        })
    })
})  