import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { Activity } from '../../domain/entities/activity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';

export type ChangeActivityInput = {
  characterId: string;
  accountId: string;
  activity: Activity;
  activityEndsAt?: Date | null;
};

/**
 * Trocar de atividade primeiro fecha o efeito da atividade anterior (via
 * RecomputeCharacterUseCase) antes de gravar a nova — ver
 * docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 * Só o dono do personagem pode trocar sua atividade.
 */
@Injectable()
export class ChangeActivityUseCase {
  constructor(
    private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase,
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(input: ChangeActivityInput): Promise<Character> {
    const now = new Date();
    const recomputed = await this.recomputeCharacterUseCase.execute(input.characterId, now);

    if (recomputed.accountId !== input.accountId) {
      throw new ForbiddenException('You do not own this character');
    }

    const updated = recomputed.changeActivity(input.activity, input.activityEndsAt ?? null, now);

    return this.characterRepository.save(updated);
  }
}
