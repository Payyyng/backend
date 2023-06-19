import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class CreatePaypalDto {

    @IsNotEmpty() readonly amount: number;

    @IsNotEmpty() readonly description : string;
    
    @IsNotEmpty() readonly fee: number;

    @IsString()
    readonly paymentLink: string;

    @IsNotEmpty()
    @IsString()
    readonly tradeAmount: number;

    @IsString()
    readonly loginDetails: string;

    @IsString()
    readonly currency: string;

    @IsString()
    readonly userId : string
}
