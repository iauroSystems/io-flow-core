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
  IsEnum,
  ArrayUnique,
  Length
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConnectorTypes, Webhooks } from 'src/common/const/enums';

class Config {

}
class Connector {
  @ApiProperty({ type: String })
  @IsEnum(ConnectorTypes)
  type: ConnectorTypes;

  @ApiProperty()
  config: Config;
}

export class CreateWebhookBodyDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  name: string;

  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

  @ApiProperty()
  @Length(24, 24)
  @IsString()
  processDefinitionId: string;

  @ApiPropertyOptional()
  @IsString()
  @Length(24, 24)
  @IsOptional()
  taskId?: string;

  @ApiProperty({ type: String })
  @IsEnum(Webhooks)
  webhook: Webhooks;

  @ApiProperty({ type: Connector })
  @IsNotEmptyObject()
  connector: Connector;
}
