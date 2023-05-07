import { ApiProperty } from '@nestjs/swagger';
import {
    Length,
    IsEmail,
    IsNotEmpty,
    IsString,
} from 'class-validator';

export class BVNverificationDto {

    @ApiProperty()
    @IsNotEmpty() readonly id: string;

    @ApiProperty()
    @IsNotEmpty()
    readonly bvn: number;

}