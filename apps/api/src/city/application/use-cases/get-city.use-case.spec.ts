import { GetCityUseCase } from './get-city.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { CityMap } from '../../domain/entities/city-map.entity';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

describe('GetCityUseCase', () => {
  function buildUseCase() {
    const lotRepository = { findAll: jest.fn() } as unknown as jest.Mocked<LotRepository>;
    const getOrGenerateCityMapUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetOrGenerateCityMapUseCase>;
    const useCase = new GetCityUseCase(lotRepository, getOrGenerateCityMapUseCase);
    return { useCase, lotRepository, getOrGenerateCityMapUseCase };
  }

  it('returns the city dimensions, terrain tiles and every lot', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();
    const tiles = [{ x: 0, y: 0, type: 'grass' as const }];
    const cityMap = new CityMap({ width: 40, height: 40, seed: 'seed', tiles });
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(cityMap);
    const lots = [Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')];
    lotRepository.findAll.mockResolvedValue(lots);

    const result = await useCase.execute();

    expect(result).toEqual({ width: 40, height: 40, tiles, lots });
  });
});
