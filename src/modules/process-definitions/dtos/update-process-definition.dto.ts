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
  Length,
} from 'class-validator'

import { Type } from 'class-transformer';
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';

class User {
  @ApiProperty()
  @IsOptional()
  userId: string;

  @ApiProperty()
  @IsOptional()
  emailId: string;
}
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
class Config {

}
class Connector {
  @ApiProperty({ type: String })
  @IsEnum(ConnectorTypes)
  type: ConnectorTypes;

  @ApiProperty()
  config: Config
}

class Condition {
  @ApiProperty()
  name: string;

  @ApiProperty( { type: {} } )
  expVariables: {};

  @ApiProperty()
  expression: string;

  @ApiProperty()
  onTrueNextStage: string;

  @ApiProperty()
  onFalseNextStage: string;
}


export class StageDefinition {
  @Length(1, 24)
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

  @ApiProperty({ type: DefinitionCriteria })
  @IsOptional()
  criteria?: DefinitionCriteria;

  @ApiProperty({ type: Connector })
  @IsOptional()
  connector: Connector;

  @ApiProperty({ type: String })
  @IsOptional()
  @Length(24, 24)
  processDefinitionId?: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @Length(1, 24)
  processDefinitionKey?: string;
}


export class UpdateProcessDefinitionDto {
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsArray()
  @ApiProperty({ type: [Property] })
  @IsOptional()
  properties?: Property[];

  @ApiProperty({ type: DefinitionCriteria })
  @IsOptional()
  criteria?: DefinitionCriteria;

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

  @ApiProperty({ type: User })
  @IsOptional()
  createdBy?: User; // this field is temporary

}

export class UpdateDefinitionParams {
  @ApiPropertyOptional()
  @IsString()
  processDefinitionId: string;

  @ApiPropertyOptional()
  @IsString()
  stageId: string;
}
