import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class PayyngTransferDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: number;

    @ApiProperty()
    @IsNotEmpty() readonly userName: string;

    @ApiProperty()
    @IsString() readonly narration: string;

    
    @ApiProperty()
    @IsString() readonly currency: string;
}