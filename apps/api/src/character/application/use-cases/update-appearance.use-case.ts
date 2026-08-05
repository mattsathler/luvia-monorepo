import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { Appearance } from '../../domain/entities/appearance';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';

export type UpdateAppearanceInput = {
  characterId: string;
  accountId: string;
  appearance: Partial<Appearance>;
};

/**
 * Troca peças do guarda-roupa (ver docs/decisions/0019-personagem-montado-em-camadas-com-rig-2d.md).
 * Só o dono do personagem pode editar seu visual.
 */
@Injectable()
export class UpdateAppearanceUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: UpdateAppearanceInput): Promise<Character> {
    const character = await this.characterRepository.findById(input.characterId);

    if (!character) {
      throw new NotFoundException(`Character ${input.characterId} not found`);
    }

    if (character.accountId !== input.accountId) {
      throw new ForbiddenException('You do not own this character');
    }

    const updated = character.updateAppearance(input.appearance);

    return this.characterRepository.save(updated);
  }
}
