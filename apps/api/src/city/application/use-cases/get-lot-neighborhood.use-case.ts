import { Inject, Injectable } from '@nestjs/common';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { chebyshevDistance } from '../../domain/entities/distance';
import { LOT_TYPE_NAMES } from '../../domain/entities/lot.entity';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';
import { WORKPLACE_REPOSITORY, WorkplaceRepository } from '../../domain/repositories/workplace.repository';

export type NeighborhoodEntry = {
  kind: 'lot' | 'workplace';
  id: string;
  x: number;
  y: number;
  distanceBlocks: number;
  /** Só presente em `kind: 'lot'`. */
  ownerName?: string;
  typeName?: string;
  /**
   * Só presente em `kind: 'workplace'` — o nome de exibição vive no catálogo
   * do bounded context `employment` (`BUILDING_CATALOG`), que `city` não
   * importa (ver workplace.entity.ts). Resolvido no frontend, mesmo padrão
   * já usado pra `LotType` (ver LOT_TYPE_LABELS em LotDetailModal.controller.tsx).
   */
  buildingTypeId?: string;
};

const DEFAULT_LIMIT = 6;

/**
 * "O que há na vizinhança" de uma posição da grade — outros lotes e prédios
 * de trabalho mais próximos, ordenados por distância em blocos. Usado pela
 * inspeção de lote (ver docs/ui-ux, protótipo do modal "Inspecionar lote")
 * pra qualquer posição, com ou sem lote — não depende de um `Lot` existir
 * ali (ver docs/decisions/0006-um-lote-de-cada-tipo-por-jogador.md: lotes só
 * existem depois de reivindicados).
 */
@Injectable()
export class GetLotNeighborhoodUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    @Inject(WORKPLACE_REPOSITORY)
    private readonly workplaceRepository: WorkplaceRepository,
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
  ) {}

  async execute(x: number, y: number, excludeLotId?: string, limit = DEFAULT_LIMIT): Promise<NeighborhoodEntry[]> {
    const [allLots, workplaces] = await Promise.all([this.lotRepository.findAll(), this.workplaceRepository.findAll()]);
    const otherLots = allLots.filter((lot) => lot.id !== excludeLotId);
    const owners = await this.characterRepository.findByIds(otherLots.map((lot) => lot.characterId));
    const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

    const lotEntries: NeighborhoodEntry[] = otherLots.map((lot) => {
      const owner = ownerById.get(lot.characterId);
      return {
        kind: 'lot',
        id: lot.id,
        x: lot.x,
        y: lot.y,
        distanceBlocks: chebyshevDistance({ x, y }, lot),
        ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Prefeitura',
        typeName: LOT_TYPE_NAMES[lot.type],
      };
    });

    const workplaceEntries: NeighborhoodEntry[] = workplaces.map((workplace) => ({
      kind: 'workplace',
      id: workplace.id,
      x: workplace.x,
      y: workplace.y,
      distanceBlocks: chebyshevDistance({ x, y }, workplace),
      buildingTypeId: workplace.buildingTypeId,
    }));

    return [...lotEntries, ...workplaceEntries].sort((a, b) => a.distanceBlocks - b.distanceBlocks).slice(0, limit);
  }
}
