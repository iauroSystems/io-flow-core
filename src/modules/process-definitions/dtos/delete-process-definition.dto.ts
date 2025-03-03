import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class DeleteProcessDefinitionDto {
    @ApiProperty({
        default: 1,
    })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    readonly startVersion: number

    @ApiProperty({
        default: 3
    })
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    readonly endVersion: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    readonly key: string


}