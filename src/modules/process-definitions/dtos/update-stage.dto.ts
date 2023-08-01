import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString
} from 'class-validator'
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';


export class UpdateStageParams {
    @ApiPropertyOptional()
    @IsString()
    processDefinitionId: string;

    @ApiPropertyOptional()
    @IsString()
    stageId: string;
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
    onErrorComplete: boolean;

    @ApiProperty({ default: false })
    @IsOptional()
    showError: boolean;
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


export class UpdateStageBody {
    @ApiProperty({ type: String })
    @IsOptional()
    key?: string;

    @ApiProperty({ type: String })
    @IsOptional()
    name?: string;

    @IsOptional()
    @ApiProperty({ type: String })
    description?: string;

    @ApiProperty({ type: String, default: 'activity' })
    @IsEnum(StageTypes)
    @IsString()
    @IsOptional()
    type?: StageTypes;

    @ApiProperty({ type: String, default: 'system-task' })
    @IsEnum(StageSubTypes)
    @IsString()
    @IsOptional()
    subType?: StageSubTypes;

    @ApiProperty({ type: Boolean, default: true })
    @IsOptional()
    auto?: boolean; // execute stage automatically or trigger manually

    @ApiProperty({ type: Boolean, default: false })
    @IsOptional()
    disabled?: boolean; // disable stage

    @ApiProperty({ type: String, default: '' })
    @IsOptional()
    nextStage?: string;

    @IsArray()
    @ApiProperty({ type: [Property] })
    @IsOptional()
    properties?: Property[];

    @IsArray()
    @ApiProperty({ type: [Condition] })
    @IsOptional()
    conditions?: Condition[];

    @ApiProperty({ type: String })
    @IsOptional()
    @IsOptional()
    assignee?: string;

    @ApiProperty({ type: Criteria })
    @IsOptional()
    criteria?: Criteria;

    @ApiProperty({ type: Connector })
    @IsOptional()
    connector?: Connector;

    @ApiProperty({ type: String })
    @IsOptional()
    processDefinitionId?: string;
}
