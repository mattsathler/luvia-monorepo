import { Injectable } from '@nestjs/common';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

export type CityView = { width: number; height: number };

/**
 * Ver docs/decisions/0005-cidade-unica-persistente.md — existe apenas uma
 * cidade, então esta leitura não recebe nenhum id.
 *
 * Só as dimensões — não o terreno nem os lotes (isso é `GetCityChunkUseCase`,
 * pedido por chunk sob demanda). Ver docs/technical/lowys-carregamento-em-chunks.md.
 */
@Injectable()
export class GetCityUseCase {
  constructor(private readonly getOrGenerateCityMapUseCase: GetOrGenerateCityMapUseCase) {}

  async execute(): Promise<CityView> {
    const cityMap = await this.getOrGenerateCityMapUseCase.execute();
    return { width: cityMap.width, height: cityMap.height };
  }
}
