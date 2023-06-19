import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
} from 'class-validator';

export class UpdateAdminDTO {

    @ApiProperty()
    @IsNotEmpty() readonly exchangeUSD: string;

    @ApiProperty()
    @IsNotEmpty() readonly exchangeEUR: string;

    @ApiProperty()
    @IsNotEmpty() readonly exchangeGBP: string;

    @ApiProperty()
    @IsNotEmpty() readonly exchangeNGN: string;

    @ApiProperty()
    @IsNotEmpty() readonly   exchangeFee: string;

    @ApiProperty()
    @IsNotEmpty() readonly paypalRate: string;

    @ApiProperty()
    @IsNotEmpty() readonly exchangeTransactionFeePercentage: string;

    @ApiProperty()
    @IsNotEmpty() readonly paypalEmail: string;

}