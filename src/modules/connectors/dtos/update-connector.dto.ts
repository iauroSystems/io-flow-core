import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
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
import { CreateConnectorBodyDto } from './create-connector-body.dto';


export class UpdateConnectorBodyDto extends PartialType( CreateConnectorBodyDto ) { }
