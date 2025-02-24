import { IsString, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetProcessInstanceStatsQueryDto {

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly filters: string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly customFilters: string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly search: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    readonly version?: number;
}


export class GetProcessInstanceStageStatsQueryDto {

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    @Length(24, 24)
    processDefinitionId?: string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    processDefinitionKey?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    readonly version?: number;
}
