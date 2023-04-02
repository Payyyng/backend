import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
} from 'class-validator';

export class verifyAccount {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty() readonly otp: number;

}

