import { ApiProperty } from '@nestjs/swagger';
import { Length, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class createPin {
  @ApiProperty()
  @IsNotEmpty()
  readonly id: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly pin: number;
}
