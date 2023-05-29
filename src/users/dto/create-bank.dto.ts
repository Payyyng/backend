import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class createAccountDto {

    @ApiProperty()
    @IsNotEmpty() readonly email: string;


    @ApiProperty()
    @IsNotEmpty()
    readonly bvn: string;

}