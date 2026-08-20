import { Inject, Injectable } from '@nestjs/common';
import { lotsInChunk, tilesInChunk } from '../../domain/entities/chunk';
import { Lot } from '../../domain/entities/lot.entity';
import { TerrainTile } from '../../domain/entities/terrain-tile';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

export type CityChunkView = { tiles: TerrainTile[]; lots: Lot[] };

/**
 * Ver docs/technical/lowys-carregamento-em-chunks.md — o frontend só busca
 * o chunk da grade que precisa, em vez da cidade inteira (GetCityUseCase).
 */
@Injectable()
export class GetCityChunkUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    private readonly getOrGenerateCityMapUseCase: GetOrGenerateCityMapUseCase,
  ) {}

  async execute(chunkX: number, chunkY: number): Promise<CityChunkView> {
    const [cityMap, lots] = await Promise.all([
      this.getOrGenerateCityMapUseCase.execute(),
      this.lotRepository.findAll(),
    ]);

    return {
      tiles: tilesInChunk(cityMap.tiles, chunkX, chunkY),
      lots: lotsInChunk(lots, chunkX, chunkY),
    };
  }
}
