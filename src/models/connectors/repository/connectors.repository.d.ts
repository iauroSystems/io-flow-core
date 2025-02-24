import { UpdateResult } from 'typeorm';
import { BaseRepositry } from 'src/base/base.repository';
import { CreateWebhookBodyDto, UpdateWebhookBodyDto } from '../../../modules/webhooks/dtos';
import { WebhookDocument } from 'src/models/webhooks/webhooks.schema';
import { ConnectorDocument } from '../connectors.schema';

@Injectable()
export interface ConnectorRepository extends BaseRepositry<ConnectorDocument> {
  create ( setting: CreateConnectorBodyDto ): Promise<ConnectorDocument>;
  update ( condition: any, user: UpdateConnectorBodyDto ): Promise<ConnectorDocument>;
}
