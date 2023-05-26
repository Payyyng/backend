import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
} from 'class-validator';

export class CreateCardDto {

    @ApiProperty()
    @IsNotEmpty() readonly currency: string;
    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: string;

    @ApiProperty()
    @IsNotEmpty() readonly gender: string;

    @ApiProperty()
    @IsNotEmpty() readonly title: string;

    @ApiProperty()
    @IsNotEmpty() readonly phone: string;

    @ApiProperty()
    @IsNotEmpty() readonly date_of_birth: string;

    @ApiProperty()
    @IsNotEmpty() readonly first_name: string;

    @ApiProperty()
    @IsNotEmpty() readonly last_name: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty() readonly email: string;
}