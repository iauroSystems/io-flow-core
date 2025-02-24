import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional, IsString, Length
} from 'class-validator';
import { Type } from 'class-transformer';
import {  ConnectorTypes, InputStatuses } from 'src/common/const/enums';


class Config {

}

class Connector {
  @ApiProperty( { type: String } )
  @IsEnum( ConnectorTypes )
  type: ConnectorTypes;

  @ApiProperty()
  config: Config;
}

class Params {
  [key: string]: any;
}

export class CompleteTaskBody {
  @ApiProperty()
  @IsOptional()
  @Length(24, 24)
  taskId: string;

  @ApiProperty()
  @IsOptional()
  @Length(1, 24)
  taskKey: string;

  @ApiProperty({ type: String, default: '' })
  @IsEnum(InputStatuses)
  @IsOptional()
  status?: InputStatuses;

  @ApiProperty({ type: Params })
  @IsOptional()
  // @Type(() => Params)
  parameters: Params;

  // @ApiProperty()
  // @IsOptional()
  // @IsString()
  // validationId: string;

  @ApiProperty( { type: Connector } )
  @IsOptional()
  connector?: Connector;
}

export class ReAssignTaskBody {
  @ApiProperty()
  @IsOptional()
  @Length(24, 24)
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
export class CompleteTaskParams {
  @ApiProperty()
  @IsString()
  @Length(24, 24)
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

