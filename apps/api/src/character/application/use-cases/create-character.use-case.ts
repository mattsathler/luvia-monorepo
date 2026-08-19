import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';
import { DEFAULT_APPEARANCE, SkinTone } from '../../domain/entities/appearance';
import { Gender } from '../../domain/entities/gender';

export type CreateCharacterInput = {
  accountId: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  skinTone: SkinTone;
  hairType: string;
  eyeType: string;
};

/**
 * Personagem nasce sem nenhuma skill alocada (nível 0 em tudo) — ver
 * docs/decisions/0024-personagem-nasce-sem-skills.md. `Character.create`
 * já assume `skills: {}` quando nada é passado.
 */
@Injectable()
export class CreateCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: CreateCharacterInput): Promise<Character> {
    const character = Character.create(
      {
        accountId: input.accountId,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
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
