import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class bankTransferDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly account_bank: string;

    @ApiProperty()
    @IsNotEmpty() readonly account_number: number;

    @ApiProperty()
    @IsNotEmpty() readonly amount: any;

    @ApiProperty()
    @IsNotEmpty() readonly narration: string;

    @ApiProperty()
    @IsNotEmpty() readonly beneficiary_namey: string;
}