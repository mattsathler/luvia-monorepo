import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';

/**
 * Recompute individual sob demanda (lazy tick) — ver
 * docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 * Deve ser chamado antes de qualquer leitura ou atualização de um personagem.
 */
@Injectable()
export class RecomputeCharacterUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(characterId: string, now: Date = new Date()): Promise<Character> {
    const character = await this.characterRepository.findById(characterId);

    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }

    const { character: recomputed, previousLastUpdatedAt } = character.recomputeUntil(now);

    if (recomputed === character) {
      return character;
    }

    const saved = await this.characterRepository.trySave(recomputed, previousLastUpdatedAt);

    if (saved) {
      return saved;
    }

    // Outro processo (tick em lote ou outro recompute) já processou esse
    // intervalo primeiro — o estado atual dele já está correto.
    const current = await this.characterRepository.findById(characterId);
    return current ?? recomputed;
  }
}
