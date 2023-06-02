import { ApiProperty } from '@nestjs/swagger';
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
import { StageTypes, StageSubTypes } from 'src/common/const/enums';
import { CreateProcessDefinitionDto } from 'src/modules/process-definitions/dtos'

export class ProcessInstanceDto extends CreateProcessDefinitionDto {

  @IsOptional()
  timeActivated: number;

  @IsOptional()
  timeStarted: number;

  @IsOptional()
  timeCompleted: number;

  @IsOptional()
  status: string;

}