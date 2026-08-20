import { Inject, Injectable } from '@nestjs/common';
import { CITY_HEIGHT, CITY_SEED, CITY_WIDTH, CityMap } from '../../domain/entities/city-map.entity';
import { CITY_MAP_REPOSITORY, CityMapRepository } from '../../domain/repositories/city-map.repository';

/**
 * Busca o terreno singleton da cidade; se ainda não existir (ou se
 * `CITY_SEED`/`CITY_WIDTH`/`CITY_HEIGHT` mudaram no código desde a última
 * geração), gera de novo e persiste. Como a geração é pura e determinística,
 * uma corrida entre leituras concorrentes computa exatamente o mesmo
 * resultado — não precisa do controle de concorrência otimista usado por
 * `RecomputeCharacterUseCase` para `Character`.
 *
 * Compartilhado por `GetCityUseCase` e `GetCharacterLotUseCase` pra não
 * duplicar essa lógica de "buscar ou gerar".
 */
@Injectable()
export class GetOrGenerateCityMapUseCase {
  constructor(
    @Inject(CITY_MAP_REPOSITORY)
    private readonly cityMapRepository: CityMapRepository,
  ) {}

  async execute(): Promise<CityMap> {
    const existing = await this.cityMapRepository.find();

    if (existing && existing.seed === CITY_SEED && existing.width === CITY_WIDTH && existing.height === CITY_HEIGHT) {
      return existing;
    }

    return this.cityMapRepository.save(CityMap.generate());
  }
}
