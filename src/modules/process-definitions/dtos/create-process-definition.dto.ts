import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNotEmptyObject,
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
  ArrayUnique,
  Length,
  Max
} from 'class-validator';
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

class PropertyType {
  @ApiProperty({ type: String })
  type: string;

  @ApiProperty({ type: String })
  arrayOf: string;

  @IsArray()
  @ApiProperty({ type: [] })
  @IsOptional()
  properties: any[];

  @ApiProperty({ type: String })
  default: string;

  @ApiProperty({ type: Boolean })
  required: boolean;

  @ApiProperty()
  enum: [any];

  @ApiProperty()
  displayType: string;
}

class Property {
  @ApiProperty()
  key: string;

  @ApiProperty()
  section: string;

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

class StageCriteria {
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

  @IsArray()
  @ApiProperty({ type: [Property] })
  // @ValidateType(() => Property)
  // @ValidateNested({ each: true })
  @Type(() => Property)
  properties: Property[];

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

  @ApiProperty({ type: User })
  @IsOptional()
  createdBy?: User; // this field is temporary
}

function ValidateType(arg0: () => typeof StageDefinition) {
  throw new Error('Function not implemented.');
}
