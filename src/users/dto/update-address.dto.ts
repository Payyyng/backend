import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,

} from 'class-validator';

export class UpdateAddressDto {

    @ApiProperty()
    @IsNotEmpty()
    readonly city: string;

    @ApiProperty()
    @IsNotEmpty() readonly state: string;


    @ApiProperty()
    @IsNotEmpty() readonly lga: string;

    @ApiProperty()
    @IsNotEmpty() readonly address: string;
}