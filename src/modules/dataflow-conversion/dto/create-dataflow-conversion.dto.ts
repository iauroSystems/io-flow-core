import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateDataflowConversionDto {

    @IsString()
    @ApiProperty()
    _id: string

    @IsString()
    @ApiProperty()
    name: string

    @IsOptional()
    @ApiProperty()
    @IsArray()
    tags: []

    @IsOptional()
    @IsString()
    @ApiProperty()
    project_id: string

    @IsOptional()
    @IsString()
    @ApiProperty()
    pipeline_id: string

    @IsArray()
    @ApiProperty()
    nodes: []

    @IsOptional()
    @IsArray()
    @ApiProperty()
    flowchart: []
}
