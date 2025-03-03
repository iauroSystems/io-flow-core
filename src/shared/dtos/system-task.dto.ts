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


class PropertyType {
  @ApiProperty()
  type: string;

  @ApiProperty()
  default: string;

  @ApiProperty()
  required: boolean;

  @ApiProperty()
  enum: [any];
}

class Property {
  @ApiProperty()
  key: string;

  @ApiProperty({ type: PropertyType })
  value: PropertyType;
}

export class SystemTask {
  @ApiProperty()
  id: string;

  @IsOptional()
  @ApiProperty()
  name: string;

  @IsOptional()
  @ApiProperty()
  description: string;

  @ApiProperty({ default: 'system-task' })
  type: string; //start, end, gateway, system task, timer

  @ApiProperty()
  auto: boolean; // execute stage automatically or trigger manually

  @ApiProperty()
  disabled: boolean; // disable stage

  @ApiProperty({ type: [Property] })
  parameters: Property[];

  @ApiProperty()
  nextStage: string;

  @IsObject()
  @ApiProperty({ type: [Property] })
  @IsOptional()
  properties: Property[];

  @ApiProperty({ type: [Property] })
  executor: Property[];

  @ApiProperty({ type: [Property] })
  criteria: Property[];

}