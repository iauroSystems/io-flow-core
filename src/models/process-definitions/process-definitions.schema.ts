import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types, Schema as SchemaTypes } from 'mongoose';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';


export type ProcessDefinitionDocument = ProcessDefinition & Document;

class CompiledDefinition { }

class Expression {
  @Prop()
  lhs: SchemaTypes.Types.Mixed;

  @Prop()
  op: string;

  @Prop()
  rhs: SchemaTypes.Types.Mixed
}

class Condition {
  @Prop()
  name: string;

  @Prop()
  op: string;

  @Prop({ type: [Expression] })
  expressions: Expression[]

  @Prop()
  onTrueNextStage: string;

  @Prop()
  onFalseNextStage: string
}

class PropertyType {
  @Prop()
  type: string;

  @Prop()
  arrayOf: string;

  @Prop()
  default: string;

  @Prop()
  required: boolean;

  @Prop()
  enum: [any];

  @Prop()
  properties: [any];

  @Prop()
  displayType: string;
}

class Property {
  @Prop()
  key: string;

  @Prop()
  section: string;

  @Prop({ type: PropertyType })
  value: PropertyType;
}

class Criteria {
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

  @Prop({ type: Boolean, default: true })
  onErrorComplete: boolean; // Stage level criteria

  @Prop({ type: Boolean, default: false })
  showError: boolean; // stage level criteria
}

class Connector {
  @Prop({ type: String, enum: ConnectorTypes })
  type: ConnectorTypes;

  @Prop()
  config: SchemaTypes.Types.Mixed
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
  disabled: boolean; // disable stage

  @Prop({ default: true })
  mandatory: boolean; // disable stage

  @Prop({ type: [String] })
  nextStages: string[];

  @Prop()
  defaultNextStage: string;

  @Prop([Property])
  properties: Property[];

  @Prop([Condition])
  conditions: Condition[];

  @Prop([String])
  parallelStages: string[];


  @Prop({ type: String })
  assignee: string;

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop({ type: Connector, default: null })
  connector?: Connector;

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop({ default: 0 })
  estimatedTimeDuration?: number; // milliseconds

  @Prop()
  priority?: string;
}


@Schema({ timestamps: true })
export class ProcessDefinition extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ index: true })
  key: string;

  @Prop({ default: false })
  isParallel: boolean;

  @Prop({ type: Criteria, default: null })
  criteria?: Criteria;

  @Prop()
  description: string;

  @Prop({ required: true })
  version: number;

  @Prop([Property])
  properties: Property[];

  @Prop([StageDefinitionSchema])
  stages: StageDefinitionSchema[];

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop({ type: CompiledDefinition })
  _compiledDefinition?: CompiledDefinition;
}

export const ProcessDefinitionSchema = SchemaFactory.createForClass(ProcessDefinition);
ProcessDefinitionSchema.index({ key: 1, version: 1 }, { unique: true });