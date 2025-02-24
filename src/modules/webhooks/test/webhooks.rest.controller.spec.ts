import { HttpStatus } from "@nestjs/common";
import CustomResponse from '../../../common/providers/custom-response.service';
import { CreateWebhookBodyDto, GetWebhookQueryDto, UpdateWebhookBodyDto, UpdateWebhookParamsDto} from "../dtos";
import { WebhookService } from "../webhooks.service";
import { CommonHeadersDto } from "../../../shared/dtos";
import { WebhookController } from "../webhooks.rest.controller";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomMessages } from "src/common/const/custom-messages";
import { createReadStream } from "fs";
import { Readable } from "stream";



let mockWebhookService={
    create:jest.fn(),
    findAll:jest.fn(),  
    findOne: jest.fn(),
    update:jest.fn(),
}
let headers:CommonHeadersDto={
    'x-tenant-id':'iauro',
    'authorization':'',
    'user-id':''
}

const createWebhook=new CreateWebhookBodyDto ;
const getWehook=new GetWebhookQueryDto;
const updateWebhookBody= new UpdateWebhookBodyDto
const updateWebhookParam=new UpdateWebhookParamsDto;


describe('Webhook Controller',()=>{
    let webhookController:WebhookController;
    let webhookService:WebhookService;
    beforeEach(async ()=>{
        const module:TestingModule=await Test.createTestingModule({
            controllers:[WebhookController],
            providers:[
                {
                    provide:WebhookService,
                    useValue:mockWebhookService
                }
            ]
        }).compile();
        webhookController=module.get<WebhookController>(WebhookController);
        webhookService=module.get<WebhookService>(WebhookService)
    })

    it('should be defined',()=>{
        expect(webhookController).toBeDefined();
    })

    describe('create',()=>{
        it('should create webhook',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WEBHOOK_CREATED);
            jest.spyOn(webhookService,'create').mockImplementation(() => Promise.resolve(response));
            expect(await webhookController.create(headers,createWebhook)).toBe(response);
        })
    })

    describe('findAll',()=>{
        it('should list all webhooks',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.SUCCESS);
            jest.spyOn(webhookService,'findAll').mockImplementation(() => Promise.resolve(response));
            expect(await webhookController.findAll(headers, getWehook)).toBe(response);
        })
    })

    describe('findOne',()=>{
        it('should return webhook of provided webhook id',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.SUCCESS);
            jest.spyOn(webhookService,'findOne').mockImplementation(() => Promise.resolve(response));
            expect(await webhookController.findOne(headers, '652e8bda07940cd14392f02a')).toBe(response);
        })
    })

    describe('update',()=>{
        it('should update webhook',async()=>{
            const response = new CustomResponse(HttpStatus.CREATED, CustomMessages.WORKFLOW_CREATED);
            jest.spyOn(webhookService,'update').mockImplementation(() => Promise.resolve(response));
            expect(await webhookController.updateOne(headers, '652e8bda07940cd14392f02a', updateWebhookBody)).toBe(response);
        })
    })
})

