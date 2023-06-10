import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
    IsNumber
} from 'class-validator';

export class ResetPasswordDto {

    @ApiProperty()
    @IsEmail() readonly email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    readonly otp: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly password: string;
}