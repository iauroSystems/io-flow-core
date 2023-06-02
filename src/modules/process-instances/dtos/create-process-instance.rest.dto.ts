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
  IsEnum
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


}

export class GetOneProcessInstanceQueryDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly version: number;

}