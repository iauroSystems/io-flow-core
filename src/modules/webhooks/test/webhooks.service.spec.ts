import { HttpStatus } from "@nestjs/common";
import { CreateWebhookBodyDto, GetWebhookQueryDto, UpdateWebhookBodyDto } from "../dtos";
import CustomResponse from '../../../../src/common/providers/custom-response.service';
import CustomError from "../../../../src/common/exceptions/custom-error";
import { CustomMessages } from "../../../../src/common/const/custom-messages";
import { WebhookRepositoryImpl } from "../../../../src/models/webhooks/repository/webhooks.repository.impl";
import { WebhookService } from "../webhooks.service";
import { Test } from "@nestjs/testing";
import { ConnectorTypes, Webhooks } from "src/common/const/enums";
import { Webhook } from "src/models/webhooks/webhooks.schema";
import { getModelToken } from "@nestjs/mongoose";


const createWebhookDto = new CreateWebhookBodyDto;
const payloadCreateWebhookDto: CreateWebhookBodyDto = {
    'name': '',
    'description': '',
    'processDefinitionId': '',
    'taskId': '',
    'webhook': Webhooks.CREATE_INSTANCE,
    'connector': {
        'type': ConnectorTypes.REST,
        'config': ''
    }

}

const mockService = {
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    find: jest.fn()
}

const payloadUpdateWebhookDto: UpdateWebhookBodyDto = {
    'name': '',
    'description': '',
    'processDefinitionId': '',
    'taskId': '',
    'webhook': Webhooks.CREATE_INSTANCE,
    'connector': {
        'type': ConnectorTypes.REST,
        'config': ''
    }
}

describe('WebhookService', () => {
    let webhookService: WebhookService;
    let webhookRepository: WebhookRepositoryImpl;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                WebhookService,
                {
                    provide: WebhookRepositoryImpl,
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        count: jest.fn(),
                        find: jest.fn()
                    },
                },
                {
                    provide: getModelToken(Webhook.name),
                    useValue: mockService,
                }
            ],
        }).compile();

        webhookService = moduleRef.get<WebhookService>(WebhookService);
        webhookRepository = moduleRef.get<WebhookRepositoryImpl>(WebhookRepositoryImpl);
    });

    describe('create', () => {
        it('should create a new webhook', async () => {
            createWebhookDto.name = 'webhook';
            const expectedRes = new CustomResponse(HttpStatus.CREATED, CustomMessages.WEBHOOK_CREATED);
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValue(undefined);
            jest.spyOn(webhookRepository, 'create').mockResolvedValue(undefined);
            const result = await webhookService.create(payloadCreateWebhookDto);
            expect(result).toEqual(expectedRes);
        });
        it('should return duplicate webhook error', async () => {
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValueOnce(payloadUpdateWebhookDto as any);
            await expect(webhookService.create(payloadCreateWebhookDto)).rejects.toThrow(new CustomError(HttpStatus.CONFLICT, CustomMessages.WEBHOOK_EXISTS));
        });
    });

    describe('update', () => {
        it('should update the Webhook', async () => {
            const expectedResponse = new CustomResponse(HttpStatus.OK, CustomMessages.WEBHOOK_UPDATED);
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValueOnce(payloadUpdateWebhookDto as any)
            jest.spyOn(webhookRepository, 'create').mockImplementation();
            const result = await webhookService.update('', payloadUpdateWebhookDto);
            expect(result).toEqual(expectedResponse);
        })
        it('should throw error if webhook not found', async () => {
            const id = 'some-id';
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(webhookService.update(id, payloadUpdateWebhookDto)).rejects.toThrow(new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WEBHOOK_NOT_FOUND));
        })
    })
    describe('findAll', () => {
        it('should return CustomResponse with HttpStatus.OK and webhooks data when webhooks are found', async () => {
            const query: GetWebhookQueryDto = {
                filters: JSON.stringify({ status: 'ACTIVE' }),
                search: JSON.stringify({ name: 'Webhook 1' }),
                page: 1,
                size: 10,
                customFilters: "",
                sort: ""
            };
            const count = 1;
            const data = [];
            jest.spyOn(webhookRepository, 'count').mockResolvedValueOnce(count);
            jest.spyOn(webhookRepository, 'find').mockResolvedValueOnce(data);
            const result = await webhookService.findAll(query);
            expect(result).toEqual(new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, { count, data }));
        });

        it('should throw CustomError object when query parameter is invalid JSON', async () => {
            const query: GetWebhookQueryDto = {
                filters: '{status": "active"}',
                search: '{"name": "Webhook"}',
                page: 1,
                size: 10,
                customFilters: "",
                sort: ""
            };
            const expectedError = new CustomError(HttpStatus.BAD_REQUEST, ` [filters/search] ${CustomMessages.INVALID_JSON}`);
            await expect(webhookService.findAll(query)).rejects.toThrowError(expectedError);
        });
    });


    describe('findOne function should work', () => {
        it('should return one webhook', async () => {
            const expectedRes = new CustomResponse(HttpStatus.OK, CustomMessages.SUCCESS, payloadCreateWebhookDto);
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValueOnce(payloadCreateWebhookDto as any);
            const result = await webhookService.findOne('');
            expect(result).toEqual(expectedRes);
        })

        it('should throw error if webhook not found', async () => {
            const id = 'some-id';
            jest.spyOn(webhookRepository, 'findOne').mockResolvedValueOnce(undefined);
            await expect(webhookService.findOne(id)).rejects.toThrow(new CustomError(HttpStatus.BAD_REQUEST, CustomMessages.WORKFLOW_NOT_FOUND));
        })
    })
});