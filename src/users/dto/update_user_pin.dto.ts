import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
} from 'class-validator';

export class UpdateTransactionPinDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly new_pin: number;

    @ApiProperty()
    @IsNotEmpty() readonly current_pin: number;
}