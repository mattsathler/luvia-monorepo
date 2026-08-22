import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';

const MAX_RETRIES = 5;

/**
 * Credita dinheiro num personagem — usado pelo bounded context `employment`
 * pra pagar o Contract (ver docs/game-design/jobs.md), sem que `character`
 * precise saber que emprego existe (só expõe este use-case).
 *
 * Diferente de RecomputeCharacterUseCase (que, em conflito de CAS, aceita o
 * estado atual como já correto — a recomputação é idempotente), aqui um
 * conflito precisa de retry de verdade: um delta (`amount`) tem que ser
 * aplicado, não pode ser descartado, senão o pagamento simplesmente some.
 */
@Injectable()
export class CreditCharacterMoneyUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(characterId: string, amount: number): Promise<Character> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const character = await this.characterRepository.findById(characterId);

      if (!character) {
        throw new NotFoundException(`Character ${characterId} not found`);
      }

      const credited = character.credit(amount);
      const saved = await this.characterRepository.trySave(credited, character.lastUpdatedAt);

      if (saved) {
        return saved;
      }
    }

    throw new Error(`Failed to credit character ${characterId} after ${MAX_RETRIES} attempts (too much contention)`);
  }
}
