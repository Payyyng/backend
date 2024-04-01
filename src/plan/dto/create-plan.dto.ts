import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsNotEmpty() readonly amount: number;

  @IsNotEmpty() readonly network: string;

  @IsNotEmpty() readonly type: number;

  @IsString()
  readonly bundle: string;

  @IsNotEmpty()
  @IsString()
  readonly dataId: number;
}
