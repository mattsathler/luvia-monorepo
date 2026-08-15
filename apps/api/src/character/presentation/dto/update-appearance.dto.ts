import { IsIn, IsOptional, IsString } from 'class-validator';
import { SKIN_TONES, SkinTone } from '../../domain/entities/appearance';

export class UpdateAppearanceDto {
  @IsOptional()
  @IsIn(SKIN_TONES)
  skinTone?: SkinTone;

  @IsOptional()
  @IsString()
  face?: string;

  @IsOptional()
  @IsString()
  accessory?: string | null;

  @IsOptional()
  @IsString()
  top?: string;

  @IsOptional()
  @IsString()
  pants?: string;

  @IsOptional()
  @IsString()
  shoes?: string;

  @IsOptional()
  @IsString()
  overlay?: string;
}
