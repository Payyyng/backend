import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class createTransactionDTO {

    @ApiProperty()
    @IsNotEmpty() readonly userId: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: number;

    @ApiProperty()
    @IsNotEmpty() readonly type: string;

    @ApiProperty()
    @IsNotEmpty() readonly billerName: string;

    @ApiProperty()
    @IsNotEmpty() readonly customer: string;

    @ApiProperty()
    @IsNotEmpty() readonly currency: string;

    @ApiProperty() readonly fee: number;

    @ApiProperty()
    @IsNotEmpty() readonly narration: string;

    @ApiProperty()
    @IsNotEmpty() readonly bankName: string;

    @ApiProperty()
    @IsString() readonly status: string;

    @ApiProperty()
     @IsString() readonly transactionType: string
}