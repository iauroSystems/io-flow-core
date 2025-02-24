import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types, Schema as SchemaTypes } from 'mongoose';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';


export type ProcessDefinitionDocument = ProcessDefinition & Document;

class CompiledDefinition { }

class Params extends Document {
  [key: string]: any;
}
class User {
  @Prop()
  userId: string;

  @Prop()
  emailId: string;
}

class Condition {
  @Prop()
  name: string;

  @Prop()
  expression: string;

  @Prop({ type: {} })
  variables: {};

  @Prop()
  _valid: boolean;

  @Prop()
  onTrueNextStage: string;

  @Prop()
  onFalseNextStage: string;
}

class Connector {
  @Prop({ type: String, enum: ConnectorTypes })
  type: ConnectorTypes;

  @Prop()
  config: SchemaTypes.Types.Mixed;

  @Prop()
  connectorId: string;
}

class DefinitionCriteria extends Document {
  @Prop({ type: Boolean, default: false })
  showError: boolean;

  @Prop()
  allCompleted: boolean;

  @Prop()
  anyCompleted: boolean;

  @Prop()
  allActivitiesCompleted: boolean;

  @Prop()
  anyActivitiesCompleted: boolean;

  @Prop()
  allSuccess: boolean;

  @Prop()
  anySuccess: boolean;

  @Prop({ type: Boolean, default: true })
  mandatoryCompleted: boolean;
}

class StageCriteria extends Document {
  @Prop({ type: Boolean, default: true })
  onErrorComplete: boolean;

  @Prop({ type: Boolean, default: false })
  showError: boolean;

  @Prop({ type: Boolean, default: false })
  retry: boolean;

  @Prop({ type: Number, default: 2 })
  retries: number;

  @Prop({ type: Number, default: 2000 })
  retryIntervalMs: number;
}

@Schema()
class StageDefinitionSchema {
  @Prop()
  key: string;

  @Prop()
  name: string;

  @Prop()
  displayName: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: StageTypes, default: 'activity' })
  type: StageTypes; //start, end, gateway, system task, timer

  @Prop({ type: String, enum: StageSubTypes, default: 'system-task' })
  subType: StageSubTypes; //start, end, gateway, system task, timer

  @Prop({ default: true })
  auto: boolean; // execute stage automatically or trigger manually

  @Prop({ default: false })
  isIterative: boolean; // isIterative stage

  @Prop({ default: true })
  mandatory: boolean;

  @Prop({ type: [String] })
  nextStages: string[];

  @Prop([Condition])
  conditions: Condition[];

  @Prop(Params)
  parameters?: Params;

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ type: StageCriteria })
  criteria?: StageCriteria;

  @Prop({ type: Connector, default: null })
  connector?: Connector;

  @Prop({ type: String })
  assignee: string;

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop({ default: 0 })
  estimatedTimeDuration?: number; // milliseconds

  @Prop()
  priority?: string;

  @Prop()
  formId?: string;

  @Prop()
  customParams?: SchemaTypes.Types.Mixed;
}


@Schema({ timestamps: true })
export class ProcessDefinition extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ index: true })
  key: string;

  @Prop({ default: false })
  isParallel: boolean;

  @Prop({ type: DefinitionCriteria, default: null })
  criteria?: DefinitionCriteria;

  @Prop()
  description: string;

  @Prop({ required: true })
  version: number;

  @Prop(Params)
  parameters: Params;

  @Prop([StageDefinitionSchema])
  stages: StageDefinitionSchema[];

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop()
  formId?: string;

  @Prop({ type: CompiledDefinition })
  _compiledDefinition?: CompiledDefinition;

  @Prop()
  createdBy?: User;

  @Prop()
  updatedBy?: User;

  @Prop({ default: false })
  default: boolean;
}

export const ProcessDefinitionSchema = SchemaFactory.createForClass(ProcessDefinition);
ProcessDefinitionSchema.index({ key: 1, version: 1 }, { unique: true });
ProcessDefinitionSchema.index({ key: 1 });
