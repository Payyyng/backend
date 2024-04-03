import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KycVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly bvn: number;
}
