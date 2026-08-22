import { IsNotEmpty, IsString } from 'class-validator';

export class StartContractDto {
  @IsString()
  @IsNotEmpty()
  workplaceId!: string;
}
