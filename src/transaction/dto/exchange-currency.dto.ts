import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class ExchangeDTO {
    
    @ApiProperty()
    @IsNotEmpty() readonly newAmount: number;

    @ApiProperty()
    @IsNotEmpty() readonly newCurrency: string;

    @ApiProperty()
    @IsString() readonly exchangeCurrency: string;

    @ApiProperty()
    @IsString() readonly exchangeAmount: number;
}