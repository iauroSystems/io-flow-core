import { IsString, IsOptional, IsNumber, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetMyTasksQueryDto {
    @ApiProperty({
        default: 0,
    })
    @IsNumber()
    @Type(() => Number)
    readonly page: number;

    @ApiProperty({
        default: 10,
    })
    @IsNumber()
    @Type(() => Number)
    readonly size: number;

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
    readonly sort: string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly search: string;
}

export class GetMyTasksHeadersDto {
    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly 'x-tenant-id': string;

    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly 'user-id': string;
}

export class GetMyTasksParamsDto {
    @IsString()
    @ApiPropertyOptional()
    @Length(24, 24)
    readonly processInstanceId: string;
}

export class Filters {
    status?: string;
    startDate?: number;
    endDate?: number;
} 
