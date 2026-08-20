import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { findFreeBuildablePosition } from '../../domain/entities/city-map.entity';
import { Lot } from '../../domain/entities/lot.entity';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

/**
 * Todo personagem tem direito a 1 lote residencial (ver
 * docs/decisions/0006-um-lote-de-cada-tipo-por-jogador.md). Se ele ainda não
 * tem um, esta leitura já reivindica uma posição livre e reivindicável
 * (terreno `grass`) na grade e persiste — mesmo padrão de efeito colateral
 * em leitura usado por RecomputeCharacterUseCase (ver
 * docs/technical/simulation-tick.md).
 */
@Injectable()
export class GetCharacterLotUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    private readonly getOrGenerateCityMapUseCase: GetOrGenerateCityMapUseCase,
  ) {}

  async execute(characterId: string): Promise<Lot> {
    const existing = await this.lotRepository.findByCharacterId(characterId);
    if (existing) {
      return existing;
    }

    const [cityMap, lots] = await Promise.all([
      this.getOrGenerateCityMapUseCase.execute(),
      this.lotRepository.findAll(),
    ]);

    const position = findFreeBuildablePosition(cityMap.tiles, lots);
    if (!position) {
      throw new ConflictException('A cidade não tem mais posições livres para lotes residenciais.');
    }

    const lot = Lot.create({ characterId, type: 'residential', ...position }, randomUUID());
    return this.lotRepository.save(lot);
  }
}
