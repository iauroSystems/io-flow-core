import { IsString, IsOptional, IsNumber } from 'class-validator';
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
