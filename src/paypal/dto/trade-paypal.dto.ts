import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class MakePayment {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: number;
    
    @ApiProperty()
    @IsNotEmpty() readonly fee: number;

    @ApiProperty()
    @IsString()
    readonly description: string;

    @ApiProperty()
    @IsString()
    readonly loginDetails: string;

    @ApiProperty()
    @IsString()
    readonly currency: string;


}