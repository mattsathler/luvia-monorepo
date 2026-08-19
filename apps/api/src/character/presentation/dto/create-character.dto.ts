import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { GENDERS, Gender } from '../../domain/entities/gender';
import { SKIN_TONES, SkinTone } from '../../domain/entities/appearance';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsIn(GENDERS)
  gender!: Gender;

  @IsIn(SKIN_TONES)
  skinTone!: SkinTone;

  @IsString()
  @IsNotEmpty()
  hairType!: string;

  @IsString()
  @IsNotEmpty()
  eyeType!: string;
}
