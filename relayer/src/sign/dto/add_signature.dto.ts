import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Add_signatureDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly signature: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly sender: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly x: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly token: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly amount: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    readonly deadline: number;
}
