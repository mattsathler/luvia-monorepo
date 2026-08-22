import { Inject, Injectable } from '@nestjs/common';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { chebyshevDistance } from '../../domain/entities/distance';
import { LOT_TYPE_NAMES } from '../../domain/entities/lot.entity';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';

export type LotSearchResult = {
  lotId: string;
  typeName: string;
  ownerName: string;
  x: number;
  y: number;
  /** Distância em blocos até a casa (lote residencial) de `characterId` — `null` sem `characterId` ou sem lote próprio ainda. */
  distanceBlocks: number | null;
};

/**
 * Ponto de navegação rápida do jogador (busca de lotes) — hoje só existe
 * lote residencial, então a busca é por dono; quando lotes comerciais e
 * empregos existirem (ver docs/game-design/jobs.md), esse mesmo endpoint
 * passa a devolver esses tipos também, sem mudar de forma.
 *
 * Por padrão (mesmo sem `query`), os resultados vêm ordenados do lote mais
 * próximo da casa de `characterId` pro mais distante — se `characterId` não
 * for informado (ou o personagem ainda não tiver lote), a ordem original do
 * repositório é preservada.
 */
@Injectable()
export class SearchLotsUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(query?: string, characterId?: string): Promise<LotSearchResult[]> {
    const lots = await this.lotRepository.findAll();
    const [owners, homeLot] = await Promise.all([
      this.characterRepository.findByIds(lots.map((lot) => lot.characterId)),
      characterId ? this.lotRepository.findByCharacterId(characterId) : Promise.resolve(null),
    ]);
    const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

    const results = lots
      .map((lot) => {
        const owner = ownerById.get(lot.characterId);
        return {
          lotId: lot.id,
          typeName: LOT_TYPE_NAMES[lot.type],
          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : '',
          x: lot.x,
          y: lot.y,
          distanceBlocks: homeLot ? chebyshevDistance(homeLot, lot) : null,
        };
      })
      .sort((a, b) => (a.distanceBlocks ?? Infinity) - (b.distanceBlocks ?? Infinity));

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
