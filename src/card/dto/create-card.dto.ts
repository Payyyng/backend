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
    @IsNotEmpty() readonly title: string;

    @ApiProperty()
    @IsNotEmpty() readonly date_of_birth: string;
}