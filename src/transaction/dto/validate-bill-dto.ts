import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class ValidateBillDto {

    @ApiProperty()
    @IsNotEmpty() readonly code: string;

    @ApiProperty()
    @IsNotEmpty() readonly customer: string;

    @ApiProperty()
    @IsNotEmpty() readonly item_code: string;
}