import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommonHeadersDto {
    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly 'x-tenant-id': string;

    @IsString()
    @ApiProperty()
    readonly 'authorization': string;

    'user-id'?: string
}