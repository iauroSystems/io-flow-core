import { Module } from "@nestjs/common";
import { Webhook, WebhookSchema } from "src/models/webhooks/webhooks.schema";
import { WebhookRepositoryImpl } from "src/models/webhooks/repository/webhooks.repository.impl";
import { WebhookController } from "./webhooks.rest.controller";
import { WebhookService } from "./webhooks.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ConnectorRepositoryImpl } from "src/models/connectors/repository/connectors.repository.impl";


@Module({
  imports: [MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }])],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookRepositoryImpl]
})
export class WebhooksModule { }
