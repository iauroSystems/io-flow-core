import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetProcessDefinitionDto {
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


export class GetProcessDefinitionQueryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly version: number;

}
