import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetTasksQueryDto {
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

export class GetTasksHeadersDto {
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly 'x-tenant-id': string;
}

export class GetTasksParamsDto {
  @IsString()
  @ApiProperty()
  readonly processInstanceId: string;


}
