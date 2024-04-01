import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SmeDataDTO {
  @ApiProperty()
  @IsNotEmpty()
  readonly network_id: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly phone: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly plan_id: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly amount: number;
}
