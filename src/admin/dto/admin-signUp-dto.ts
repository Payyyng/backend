import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
} from 'class-validator';

export class SignUpAdminDTO {

    @ApiProperty()
    @IsNotEmpty() readonly email: string;

    @ApiProperty()
    @IsNotEmpty() readonly password: string;

    @ApiProperty()
    @IsNotEmpty() readonly firstName: string;

    @ApiProperty()
    @IsNotEmpty() readonly lastName: string;
}