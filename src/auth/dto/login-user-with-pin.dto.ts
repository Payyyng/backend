import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class loginUserWithPinDto {

    @ApiProperty()
    @IsEmail() readonly pin: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    readonly id: string;
}