import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types, Schema as SchemaTypes } from 'mongoose';
import { ConnectorTypes, Webhooks } from 'src/common/const/enums';


export type WebhookDocument = Webhook & Document;

class Connector {
  @Prop({ type: String, enum: ConnectorTypes })
  type: ConnectorTypes;

  @Prop()
  config: SchemaTypes.Types.Mixed;
}

@Schema({ timestamps: true })
export class Webhook extends Document {

  @Prop({ index: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  processDefinitionId: string;

  @Prop()
  taskId?: string;

  @Prop({ type: String, enum: Webhooks })
  webhook: Webhooks;

  @Prop({ type: Connector })
  connector: Connector;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
