import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types, Schema as SchemaTypes } from 'mongoose';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';


export type ProcessInstanceDocument = ProcessInstance & Document;

class Dependency extends Document {
  @Prop()
  processDefinitionKey: string;

  @Prop()
  stageKey: string;
}


class Condition extends Document {
  @Prop()
  name: string;

  @Prop()
  expression: string;

  @Prop( { type: {} } )
  expVariables: {};

  @Prop()
  _valid: boolean;

  @Prop()
  onTrueNextStage: string;

  @Prop()
  onFalseNextStage: string;
}

class Params extends Document {
  [key: string]: any;
}


class stageIndexJSON extends Document {
}
class PropertyType extends Document {
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

class Property extends Document {
  @Prop()
  key: string;

  @Prop()
  section: string;

  @Prop({ type: PropertyType })
  value: PropertyType;
}

class DefinitionCriteria extends Document {
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
}

class Flags extends Document {
  @Prop()
  _error: boolean;

  @Prop()
  _allCompleted: boolean;

  @Prop()
  _anyCompleted: boolean;

  @Prop()
  _allActivitiesCompleted: boolean;

  @Prop()
  _anyActivitiesCompleted: boolean;

  @Prop()
  _allSuccess: boolean;

  @Prop()
  _anySuccess: boolean;

  @Prop()
  _mandatoryCompleted: boolean;
}

class Connector {
  @Prop({ type: String, enum: ConnectorTypes })
  type: ConnectorTypes;

  @Prop()
  config: SchemaTypes.Types.Mixed
}

class History {
  @Prop()
  status: string;

  @Prop(Params)
  parameters: Params;

  @Prop()
  timeActivated: number;

  @Prop()
  timeStarted: number;

  @Prop()
  timeCompleted: number;

  @Prop()
  _flags: Flags;

  @Prop()
  _error: SchemaTypes.Types.Mixed

  @Prop()
  _data: SchemaTypes.Types.Mixed

}

@Schema()
class StageInstanceSchema {
  _id: Types.ObjectId

  @Prop()
  key: string;

  @Prop()
  stageId: string;

  @Prop()
  name: string;

  @Prop()
  displayName: string;

  @Prop()
  description: string;

  @Prop({ default: 'waiting' })
  status: string;

  @Prop({ type: String, enum: StageTypes, default: 'activity' })
  type: StageTypes; //start, end, gateway, system task, timer

  @Prop({ type: String, enum: StageSubTypes, default: 'system-task' })
  subType: StageSubTypes; //start, end, gateway, system task, timer

  @Prop({ default: true })
  auto: boolean; // execute stage automatically or trigger manually

  // @Prop({ default: false })
  // disabled: boolean; // disable stage

  @Prop({ default: true })
  mandatory: boolean; // disable stage

  @Prop({ type: [String] })
  nextStages: string[];

  @Prop([Property])
  properties: Property[];

  @Prop([Condition])
  conditions?: Condition[];

  @Prop([String])
  parallelStages: string[];

  @Prop(Params)
  parameters?: Params;

  @Prop({ type: String })
  assignee: string;

  @Prop({ type: [String] })
  watchers: string[];

  @Prop({ type: StageCriteria })
  criteria?: StageCriteria;

  @Prop({ type: Connector, default: null })
  connector?: Connector;

  @Prop({ required: true, default: Date.now() })
  timeActivated: number;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ default: 0 })
  estimatedTimeDuration?: number; // milliseconds

  @Prop({ default: 0 })
  expToCompleteAt?: number; // milliseconds, for timer event to complete

  @Prop()
  priority?: string;

  @Prop({ type: Flags, default: {} })
  _flags: Flags;

  @Prop()
  _error: SchemaTypes.Types.Mixed

  @Prop()
  _data: SchemaTypes.Types.Mixed

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop()
  processInstanceId?: string;

  @Prop([History])
  history: History[]

}

class User {
  @Prop()
  userId: string;

  @Prop()
  emailId: string;
}


@Schema({ timestamps: true })
export class ProcessInstance extends Document {

  @Prop()
  processDefinitionId?: string;

  @Prop()
  processDefinitionKey?: string;

  @Prop()
  parentProcessInstanceId?: string;

  @Prop()
  rootProcessInstanceId?: string;

  @Prop()
  parentTaskId?: string;

  @Prop({ index: true })
  name: string;

  @Prop({ default: false })
  isParallel: boolean;

  @Prop({ type: DefinitionCriteria, default: null })
  criteria?: DefinitionCriteria;

  @Prop()
  description: string;

  @Prop({ required: true })
  version: number;

  @Prop([Property])
  properties: Property[];

  @Prop(Params)
  parameters: Params;

  @Prop([StageInstanceSchema])
  stages: StageInstanceSchema[];

  @Prop({ required: true, default: Date.now() })
  timeActivated: number;

  @Prop({ required: true, default: -1 })
  timeStarted: number;

  @Prop({ required: true, default: -1 })
  timeCompleted: number;

  @Prop({ required: true, default: -1 })
  timeOnhold: number;

  @Prop({ required: true, default: -1 })
  timeCancelled: number;

  @Prop({ required: true, default: -1 })
  timeResumed: number;

  @Prop({ required: true, default: 'active' })
  status: string;

  @Prop(stageIndexJSON)
  _stageIndexJSON: stageIndexJSON

  @Prop({ type: Flags, default: {} })
  _flags: Flags;

  @Prop({ default: 0 })
  _startIndex: number;

  @Prop({ default: -1 })
  _endIndex: number;

  @Prop({ type: Connector })
  assigneeConnector?: Connector; // this field is temporary

  @Prop(User)
  createdBy: User;

  @Prop(User)
  holdBy: User;

  @Prop(User)
  cancelledBy: User;

  @Prop(User)
  resumedBy: User;
}

export const ProcessInstanceSchema = SchemaFactory.createForClass(ProcessInstance);
