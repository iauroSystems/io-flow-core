import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
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
} from 'class-validator'

class PropertiesDto {

}

class StagesDto {

}

export class UpdateUserTaskDto {
  @IsOptional()
  @ApiProperty()
  description: string;

  // @IsObject()
  // @ApiProperty()
  // @IsOptional()
  // properties: Record<string, any>;

  @IsObject()
  @ApiProperty()
  @IsOptional()
  stages: Record<string, any>;

}

class Params {
  [key: string]: any;
}

export class ReAssignTaskBody {
  @ApiProperty()
  @IsOptional()
  taskId: string;

  @ApiProperty()
  @IsOptional()
  taskKey: string;

  @ApiProperty()
  @IsOptional()
  assignee: string;

  @ApiProperty()
  @IsOptional()
  watchers: string[];

  @ApiProperty({ type: Params })
  @IsOptional()
  // @Type(() => Params)
  parameters: Params;

}