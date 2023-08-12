import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
} from 'class-validator';

export class SmeDataDTO {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly network_id: string;

    @ApiProperty()
    @IsNotEmpty() readonly amount: string;

    @ApiProperty()
    @IsNotEmpty() readonly name_on_card: string;

    
}