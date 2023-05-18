import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class createUserDto {

    @ApiProperty()
    @IsNotEmpty() firstName: string;

    @ApiProperty()
    @IsNotEmpty() lastName: string;

    @ApiProperty()
    @IsEmail() email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(8, 20)
    password: string;

    @ApiProperty()
    phone: string;
}