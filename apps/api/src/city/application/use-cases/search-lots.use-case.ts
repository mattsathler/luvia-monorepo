import { Inject, Injectable } from '@nestjs/common';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { LOT_TYPE_NAMES } from '../../domain/entities/lot.entity';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';

export type LotSearchResult = {
  lotId: string;
  typeName: string;
  ownerName: string;
  x: number;
  y: number;
};

/**
 * Ponto de navegação rápida do jogador (busca de lotes) — hoje só existe
 * lote residencial, então a busca é por dono; quando lotes comerciais e
 * empregos existirem (ver docs/game-design/jobs.md), esse mesmo endpoint
 * passa a devolver esses tipos também, sem mudar de forma.
 */
@Injectable()
export class SearchLotsUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(query?: string): Promise<LotSearchResult[]> {
    const lots = await this.lotRepository.findAll();
    const owners = await this.characterRepository.findByIds(lots.map((lot) => lot.characterId));
    const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

    const results = lots.map((lot) => {
      const owner = ownerById.get(lot.characterId);
      return {
        lotId: lot.id,
        typeName: LOT_TYPE_NAMES[lot.type],
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : '',
        x: lot.x,
        y: lot.y,
      };
    });

    const normalizedQuery = query?.trim().toLowerCase();
    if (!normalizedQuery) {
      return results;
    }

    return results.filter(
      (result) =>
        result.ownerName.toLowerCase().includes(normalizedQuery) ||
        result.typeName.toLowerCase().includes(normalizedQuery),
    );
  }
}
