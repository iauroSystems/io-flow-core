import { HttpStatus } from "@nestjs/common";
import CustomResponse from '../../../common/providers/custom-response.service';
import {CreateDataflowConversionDto } from "../dto/create-dataflow-conversion.dto";
import { DataflowConversionService } from "../dataflow-conversion.service";
import { CommonHeadersDto } from "../../../shared/dtos";
import { DataflowConversionController } from "../dataflow-conversion.rest.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomMessages } from "src/common/const/custom-messages";

let mockdataflowConversionService={
    create:jest.fn(),
}
let headers:CommonHeadersDto={
    'x-tenant-id':'iauro',
    'authorization':'',
    'user-id':''
}

const createDataflowConversion=new CreateDataflowConversionDto;

describe('Dataflow Conversion Controller',()=>{
    let dataflowConversionController:DataflowConversionController;
    let dataflowConversionService:DataflowConversionService;
    beforeEach(async ()=>{
        const module:TestingModule=await Test.createTestingModule({
            controllers:[DataflowConversionController],
            providers:[
                {
                    provide:DataflowConversionService,
                    useValue: mockdataflowConversionService
                }
            ]
        }).compile();
        dataflowConversionController=module.get<DataflowConversionController>(DataflowConversionController);
        dataflowConversionService=module.get<DataflowConversionService>(DataflowConversionService)
    })

    it('should be defined',()=>{
        expect(dataflowConversionController).toBeDefined();
    })

    describe('create',()=>{
        it('should create dataflow conversion',async()=>{
            const expectedResponse=new CustomResponse(HttpStatus.OK, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(dataflowConversionService,'create').mockReturnValueOnce(expectedResponse);
            expect(await dataflowConversionController.create(headers, createDataflowConversion)).toEqual(expectedResponse);
        })
    })
})

