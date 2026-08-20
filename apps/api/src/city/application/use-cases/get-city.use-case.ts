import { Inject, Injectable } from '@nestjs/common';
import { Lot } from '../../domain/entities/lot.entity';
import { TerrainTile } from '../../domain/entities/terrain-tile';
import { LOT_REPOSITORY, LotRepository } from '../../domain/repositories/lot.repository';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

export type CityView = { width: number; height: number; tiles: TerrainTile[]; lots: Lot[] };

/**
 * Ver docs/decisions/0005-cidade-unica-persistente.md — existe apenas uma
 * cidade, então esta leitura não recebe nenhum id.
 */
@Injectable()
export class GetCityUseCase {
  constructor(
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    private readonly getOrGenerateCityMapUseCase: GetOrGenerateCityMapUseCase,
  ) {}

  async execute(): Promise<CityView> {
    const [cityMap, lots] = await Promise.all([
      this.getOrGenerateCityMapUseCase.execute(),
      this.lotRepository.findAll(),
    ]);

    return { width: cityMap.width, height: cityMap.height, tiles: cityMap.tiles, lots };
  }
}
