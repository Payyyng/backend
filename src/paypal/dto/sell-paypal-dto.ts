import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellPaypalDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly amount: number;

  @ApiProperty()
  @IsString()
  readonly currency: string;

  @ApiProperty()
  readonly tradeAmount: number;
}
