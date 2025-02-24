import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { Webhook, WebhookSchema } from "src/models/webhooks/webhooks.schema";
import { WebhookRepositoryImpl } from "src/models/webhooks/repository/webhooks.repository.impl";
import { Audits } from "src/shared/clients/audit-service/audit-service.provider";
import { GrpcConnector } from "src/shared/connectors";
import { WebhookController } from "../webhooks.rest.controller";
import { WebhookService } from "../webhooks.service";
import { WebhooksModule } from "../webhooks.module";
import { Test } from "@nestjs/testing";
import { Compiler } from "src/modules/process-instances/providers";


describe('WebhooksModule', () => {
    let webhookService: WebhookService;
    let webhookRepository: WebhookRepositoryImpl;
    let webhookController: WebhookController;


    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot([{ name: Webhook.name, schema: WebhookSchema }] as any),
                WebhooksModule,
            ],
            providers: [
                WebhookService,
                WebhookRepositoryImpl,
                {
                    provide: getModelToken(Webhook.name),
                    useValue: {},
                },
                GrpcConnector, Audits, Compiler
            ],
            controllers: [WebhookController]
        }).compile();

        expect(moduleRef).toBeDefined();
        webhookService = moduleRef.get<WebhookService>(WebhookService);
        webhookRepository = moduleRef.get<WebhookRepositoryImpl>(WebhookRepositoryImpl);
        webhookController = moduleRef.get<WebhookController>(WebhookController);

    });

    describe('WebhookService', () => {
        it('should be defined', () => {
            expect(webhookService).toBeDefined();
        });
    });

    describe('WebhookRepositoryImpl', () => {
        it('should be defined', () => {
            expect(webhookRepository).toBeDefined();
        });
    });

    describe('WebhookController', () => {
        it('should be defined', () => {
            expect(webhookController).toBeDefined();
        });
    });

});