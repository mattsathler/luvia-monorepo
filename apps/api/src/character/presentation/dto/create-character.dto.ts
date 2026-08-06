import { IsIn, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { GENDERS, Gender } from '../../domain/entities/gender';
import { SKIN_TONES, SkinTone } from '../../domain/entities/appearance';
import { SkillPoints } from '../../domain/entities/skill';

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

  /**
   * Mapa skillId -> pontos distribuídos na criação. A validação de negócio
   * (ids conhecidos, soma exata do orçamento) fica em CreateCharacterUseCase,
   * que já conhece o catálogo de skills — aqui só garantimos a forma.
   */
  @IsObject()
  skills!: SkillPoints;
}
