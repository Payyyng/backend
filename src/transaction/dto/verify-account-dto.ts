import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class VerifyAccountDTO {
    
    @ApiProperty()
    @IsNotEmpty() readonly account_number: string;

    @ApiProperty()
    @IsNotEmpty() readonly account_bank: string;
}

