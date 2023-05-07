import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class createBillDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: number;

    @ApiProperty()
    @IsNotEmpty() readonly type: string;

    @ApiProperty()
    @IsNotEmpty() readonly biller_name: string;

    @ApiProperty()
    @IsNotEmpty() readonly customer: string;
}