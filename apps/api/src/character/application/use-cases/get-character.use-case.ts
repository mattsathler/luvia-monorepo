import { Injectable } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';

/**
 * Qualquer leitura do personagem primeiro o recomputa até o momento atual —
 * ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 */
@Injectable()
export class GetCharacterUseCase {
  constructor(private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase) {}

  async execute(id: string): Promise<Character> {
    return this.recomputeCharacterUseCase.execute(id);
  }
}
