import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    Length
} from 'class-validator'
import { StageTypes, StageSubTypes, ConnectorTypes } from 'src/common/const/enums';


export class UpdateStageParams {
    @ApiPropertyOptional()
    @IsString()
    @Length(24, 24)
    processDefinitionId: string;

    @ApiPropertyOptional()
    @IsString()
    @Length(24, 24)
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

class StageCriteria {
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

    @ApiProperty({ type: [String], default: [] })
    nextStages: string[];

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
}
