import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional, isString, IsString
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectorTypes, InputStatuses } from 'src/common/const/enums';

class Params {
  [key: string]: any;
}

export class CompleteTaskBody {
  @ApiProperty()
  @IsOptional()
  taskId: string;

  @ApiProperty()
  @IsOptional()
  taskKey: string;

  @ApiProperty({ type: String, default: '' })
  @IsEnum(InputStatuses)
  @IsOptional()
  status?: InputStatuses;

  @ApiProperty({ type: Params })
  @IsOptional()
  // @Type(() => Params)
  parameters: Params;
}

export class CompleteTaskParams {
  @ApiProperty()
  @IsString()
  processInstanceId: string;

}

export class CompleteTaskQuery {
  @ApiProperty()
  @IsOptional()
  @Type(() => Params)
  parameters: Params;
}

export class CompleteTasksHeadersDto {
  @IsString()
  @ApiPropertyOptional()
  @IsOptional()
  readonly 'x-tenant-id': string;
}

