import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
} from 'class-validator'

class StagesDto {

}

export class UpdateUserTaskDto {
  @IsOptional()
  @ApiProperty()
  description: string;

  @IsObject()
  @ApiProperty()
  @IsOptional()
  stages: Record<string, any>;

}
