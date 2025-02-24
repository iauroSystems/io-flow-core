import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateWebhookBodyDto, UpdateWebhookBodyDto } from '../../../modules/webhooks/dtos';
import { WebhookDocument } from 'src/models/webhooks/webhooks.schema';

@Injectable()
  export interface WebhookRepository extends BaseRepositry<WebhookDocument> {
  create(setting: CreateWebhookBodyDto): Promise<WebhookDocument>;
  update(condition: any, user: UpdateWebhookBodyDto): Promise<WebhookDocument>;
}