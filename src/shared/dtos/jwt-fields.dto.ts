import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JWTFields {
    @IsString()
    @ApiPropertyOptional()
    @IsOptional()
    readonly 'userId': string;

    @IsString()
    @ApiProperty()
    readonly 'tenantId': string;
}