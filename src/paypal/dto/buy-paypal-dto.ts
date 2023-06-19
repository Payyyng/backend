import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class BuyPaypalDTO {

    @ApiProperty()
    @IsNotEmpty() readonly amount: number;

    @ApiProperty()
    @IsNotEmpty() readonly description : string;

    @ApiProperty()
    @IsString()
    readonly currency: string;

    @ApiProperty()
    @IsString()
    readonly id: string;

    @ApiProperty()
    @IsString()
    readonly email: string;

    @ApiProperty()
    readonly tradeAmount: number
}