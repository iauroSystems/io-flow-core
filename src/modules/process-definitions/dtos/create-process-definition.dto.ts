import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  Length,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';
import { Prop } from '@nestjs/mongoose';

class User {
  @ApiProperty()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsOptional()
  emailId: string;
}

class Config {

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
  @ApiProperty({ type: String })
  @IsEnum(ConnectorTypes)
  type: ConnectorTypes;

  @ApiProperty()
  config: Config;

  @ApiProperty()
  @IsOptional()
  connectorId: string;
}

class DefinitionCriteria {
  @ApiProperty({ default: true })
  @IsOptional()
  allCompleted: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  anyCompleted: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  allActivitiesCompleted: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  anyActivitiesCompleted: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  allSuccess: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  anySuccess: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  mandatoryCompleted: boolean;
}

class StageCriteria {
  @ApiProperty({ default: true })
  @IsOptional()
  onErrorComplete: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  showError: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  retry: boolean;

  @ApiProperty({ default: 2 })
  @IsOptional()
  @Max(5)
  retries: number;

  @ApiProperty({ default: 2000 })
  @IsOptional()
  @Max(5000)
  retryIntervalMs: number;
}


class StageDefinition {
  @ApiProperty({ type: String, required: true })
  key: string;

  @ApiProperty({ type: String })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String })
  displayName: string;

  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String, default: 'event' })
  @IsEnum(StageTypes)
  @IsString()
  type: StageTypes;

  @ApiProperty({ type: String, default: 'start' })
  @IsEnum(StageSubTypes)
  @IsString()
  subType: StageSubTypes;

  @ApiProperty({ type: Boolean, default: true })
  @IsOptional()
  auto: boolean; // execute stage automatically or trigger manually

  @ApiProperty({ type: Boolean, default: false })
  @IsOptional()
  isIterative: boolean; // isIterative stage

  @ApiProperty({ type: [String], default: [] })
  nextStages: string[];

  @IsArray()
  @ApiProperty({ type: [Condition] })
  @IsOptional()
  conditions: Condition[];

  @ApiProperty()
  @IsOptional()
  assignee: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  watchers: string[];

  @ApiProperty({ type: StageCriteria })
  @IsOptional()
  criteria?: StageCriteria;

  @ApiProperty({ type: Connector })
  @IsOptional()
  connector?: Connector;

  @ApiProperty({ type: String })
  @IsOptional()
  @Length(24, 24)
  processDefinitionId?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  processDefinitionKey?: string;

  @ApiProperty({ type: Number })
  @IsOptional()
  estimatedTimeDuration?: number;

  @ApiProperty({ type: String })
  @IsOptional()
  priority?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  formId?: string;

  @ApiProperty({ type: Config })
  @IsOptional()
  customParams?: Config;
}


export class CreateProcessDefinitionDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  name: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  key: string;

  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

  @IsOptional()
  @ApiProperty({ type: Boolean, default: false })
  isParallel: boolean;

  @ApiProperty({ type: DefinitionCriteria })
  @IsOptional()
  criteria?: DefinitionCriteria;

  @IsArray()
  @ApiProperty({ type: [StageDefinition], default: [] })
  // @ValidateType(() => StageDefinition)
  // @ValidateNested({ each: true })
  @Type(() => StageDefinition)
  stages: StageDefinition[];

  @ApiProperty({ type: Connector })
  @IsOptional()
  assigneeConnector?: Connector; // this field is temporary

  @IsOptional()
  @ApiProperty({ type: String })
  formId?: string;

  @ApiProperty({ type: User })
  @IsOptional()
  createdBy?: User; // this field is temporary
}

