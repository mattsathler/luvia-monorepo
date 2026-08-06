import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';
import { DEFAULT_APPEARANCE, SkinTone } from '../../domain/entities/appearance';
import { Gender } from '../../domain/entities/gender';
import { SkillPoints, isValidInitialSkillAllocation } from '../../domain/entities/skill';

export type CreateCharacterInput = {
  accountId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  skinTone: SkinTone;
  hairType: string;
  eyeType: string;
  skills: SkillPoints;
};

@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: CreateCharacterInput): Promise<Character> {
    if (!isValidInitialSkillAllocation(input.skills)) {
      throw new BadRequestException('Invalid initial skill allocation');
    }

    const character = Character.create(
      {
        accountId: input.accountId,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        skills: input.skills,
        appearance: {
          ...DEFAULT_APPEARANCE,
          skinTone: input.skinTone,
          hairType: input.hairType,
          eyeType: input.eyeType,
        },
      },
      randomUUID(),
    );

    return this.characterRepository.save(character);
  }
}
