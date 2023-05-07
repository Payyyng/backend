import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class UpdateUserDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly firstName: string;

    @ApiProperty()
    @IsNotEmpty() readonly lastName: string;

    @ApiProperty()
    @IsNotEmpty() readonly bvn: number;

    @ApiProperty()
    @IsNotEmpty() readonly phone: number;
}