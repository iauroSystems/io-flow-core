import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

class Params {
  [key: string]: any;
}

export class CreateProcessInstanceDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // @IsOptional()
  // validationId: string;

}

export class GetOneProcessInstanceQueryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  readonly version: number;

}
