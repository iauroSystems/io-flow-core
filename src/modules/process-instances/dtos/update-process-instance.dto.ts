import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString
} from 'class-validator'
import { Transform, Type } from 'class-transformer';

class Params {
  [key: string]: any;
}

export class UpdateProcessInstanceDto {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;
}

export class UpdateProcessInstanceQueryDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ default: false })
  readonly cascade: string;
}