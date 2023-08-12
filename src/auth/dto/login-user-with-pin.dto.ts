import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class LoginUserWithPinDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString() readonly pin: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly id: string;
}