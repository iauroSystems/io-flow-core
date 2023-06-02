import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsBoolean,
  ValidateNested,
  IsDate,
  IsDateString,
  IsEmail,
  IsObject,
  IsArray,
  IsNumber,
  IsOptional,
  IsIn,
  IsEnum,
} from 'class-validator'

import { Type } from 'class-transformer';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';

class PropertyType {
  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  default: string;

  @ApiProperty({ type: Boolean })
  required: boolean;

  @ApiProperty()
  enum: [any];
}

class Property {
  @ApiProperty()
  key: string;

  @ApiProperty({ type: PropertyType })
  value: PropertyType
}

class Criteria {
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

  @ApiProperty({ default: true })
  @IsOptional()
  onErrorComplete: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  showError: boolean;
}
class Config {

}
class Connector {
  @ApiProperty({ type: String })
  @IsEnum(ConnectorTypes)
  type: ConnectorTypes;

  @ApiProperty()
  config: Config
}

class Expression {
  @ApiProperty()
  lhs: any;

  @ApiProperty()
  op: string;

  @ApiProperty()
  rhs: any;
}

class Condition {
  @ApiProperty()
  name: string;

  @ApiProperty()
  op: string;

  @ApiProperty({ type: [Expression] })
  expressions: Expression[]

  @ApiProperty()
  onTrueNextStage: string;

  @ApiProperty()
  onFalseNextStage: string
}


export class StageDefinition {
  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({ type: String })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String })
  displayName: string;

  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

  @ApiProperty({ type: String, default: 'activity' })
  @IsEnum(StageTypes)
  @IsString()
  type: StageTypes;

  @ApiProperty({ type: String, default: 'manual-task' })
  @IsEnum(StageSubTypes)
  @IsString()
  subType: StageSubTypes;

  @ApiProperty({ type: Boolean, default: true })
  @IsOptional()
  auto: boolean; // execute stage automatically or trigger manually

  @ApiProperty({ type: Boolean, default: false })
  @IsOptional()
  disabled: boolean; // disable stage

  @ApiProperty({ type: [String], default: [] })
  nextStages: string[];

  @IsArray()
  @ApiProperty({ type: [Property] })
  @IsOptional()
  properties: Property[];

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

  @ApiProperty({ type: Criteria })
  @IsOptional()
  criteria?: Criteria;

  @ApiProperty({ type: Connector })
  @IsOptional()
  connector: Connector;

  @ApiProperty({ type: String })
  @IsOptional()
  processDefinitionId?: string;
}


export class UpdateProcessDefinitionDto {
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsArray()
  @ApiProperty({ type: [Property] })
  @IsOptional()
  properties?: Property[];

  @ApiProperty({ type: Criteria })
  @IsOptional()
  criteria?: Criteria;

  @IsArray()
  @ApiProperty({ type: [StageDefinition] })
  // @ValidateType(() => StageDefinition)
  // @ValidateNested({ each: true })
  @Type(() => StageDefinition)
  stages?: StageDefinition[];

  @ApiProperty({ type: Connector })
  @IsOptional()
  assigneeConnector?: Connector; // this field is temporary

  _compiledDefinition?: any;

}

export class UpdateDefinitionParams {
  @ApiPropertyOptional()
  @IsString()
  processDefinitionId: string;

  @ApiPropertyOptional()
  @IsString()
  stageId: string;
}