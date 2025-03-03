import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional, IsString, ValidateNested
} from 'class-validator';

export class PropertiesDto {

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  datatype: string;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

}

export class CreateValidationsDto {
  @ApiProperty()
  @IsString()
  name: string;

  @IsArray()
  @ApiProperty( { type: [PropertiesDto] } )
  @ValidateNested( { each: true } )
  @Type( () => PropertiesDto )
  properties: PropertiesDto[];

  // @IsString()
  // @IsOptional()
  // joiSchema:string

}

export class TestDto {

  @ApiProperty()
  @IsObject()
  data: {};

}
