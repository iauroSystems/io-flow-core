import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  IsEnum,
  Length,
} from 'class-validator';

import { Type } from 'class-transformer';
import { StageTypes, StageSubTypes, ConnectorTypes, Webhooks } from 'src/common/const/enums';



class Config {

}
class Connector {
  @ApiProperty({ type: String })
  @IsEnum(ConnectorTypes)
  type: ConnectorTypes;

  @ApiProperty()
  config: Config;
}

export class UpdateWebhookBodyDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

  @IsString()
  @Length(24, 24)
  processDefinitionId: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(24, 24)
  taskId?: string;

  @ApiProperty({ type: String })
  @IsEnum(Webhooks)
  webhook: Webhooks;

  @ApiProperty({ type: Connector })
  connector: Connector;
}


export class UpdateWebhookParamsDto {
  @ApiPropertyOptional()
  @IsString()
  webhookId: string;
}
