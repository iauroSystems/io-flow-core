import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsEnum
} from 'class-validator';
import { ConnectorTypes } from 'src/common/const/enums';

export class CreateConnectorBodyDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  name: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty( { type: String } )
  @IsEnum( ConnectorTypes )
  type: ConnectorTypes;

  @ApiProperty()
  @IsObject()
  config: {};

  @ApiProperty()
  @IsObject()
  variables: {};

}
