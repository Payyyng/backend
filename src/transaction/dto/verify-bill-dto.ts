import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class VerifyBillDTO {
    
    @ApiProperty()
    @IsNotEmpty() readonly id: string;
}