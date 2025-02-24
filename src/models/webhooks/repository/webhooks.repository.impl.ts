import { Injectable, Scope } from '@nestjs/common';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from 'src/models/webhooks/webhooks.schema';
import { BaseRepositoryImpl } from '../../../shared/repositories/base/base-repository.impl';
import { CreateWebhookBodyDto, UpdateWebhookBodyDto } from 'src/modules/webhooks/dtos';
import { WebhookRepository } from './webhooks.repository';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WebhookRepositoryImpl extends BaseRepositoryImpl<WebhookDocument> implements WebhookRepository {
  constructor (@InjectModel(Webhook.name) protected WebhookModel: Model<WebhookDocument>) {
    super(WebhookModel);
  }

  create(object: CreateWebhookBodyDto): Promise<WebhookDocument> {
    const event = new this.WebhookModel(object);
    return event.save();
  }

  update(condition: any, object: UpdateWebhookBodyDto): Promise<WebhookDocument> {

    return this.WebhookModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

  updateStage(condition: any, object: any): Promise<WebhookDocument> {

    return this.WebhookModel.findOneAndUpdate(condition, object, { new: true }).exec();
  }

}