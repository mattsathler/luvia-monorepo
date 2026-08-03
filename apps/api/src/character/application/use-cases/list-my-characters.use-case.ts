import { Inject, Injectable } from '@nestjs/common';
import { Character } from '../../domain/entities/character.entity';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';

/**
 * Lista todos os personagens da conta autenticada, recomputando cada um
 * (mesmo mecanismo de leitura usado por GetCharacterUseCase) — é o que
 * viabiliza o polling do frontend sem duplicar a lógica de recompute.
 */
@Injectable()
export class ListMyCharactersUseCase {
  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
    private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase,
  ) {}

  async execute(accountId: string): Promise<Character[]> {
    const characters = await this.characterRepository.findByAccountId(accountId);
    const now = new Date();

    return Promise.all(characters.map((character) => this.recomputeCharacterUseCase.execute(character.id, now)));
  }
}
