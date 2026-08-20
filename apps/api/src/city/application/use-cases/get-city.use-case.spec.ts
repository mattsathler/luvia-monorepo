import { GetCityUseCase } from './get-city.use-case';
import { CityMap } from '../../domain/entities/city-map.entity';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

describe('GetCityUseCase', () => {
  function buildUseCase() {
    const getOrGenerateCityMapUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetOrGenerateCityMapUseCase>;
    const useCase = new GetCityUseCase(getOrGenerateCityMapUseCase);
    return { useCase, getOrGenerateCityMapUseCase };
  }

  it('returns the city dimensions and background color, not the terrain nor the lots', async () => {
    const { useCase, getOrGenerateCityMapUseCase } = buildUseCase();
    const cityMap = new CityMap({
      width: 40,
      height: 40,
      seed: 'seed',
      backgroundColor: '#7bc96f',
      tiles: [{ x: 0, y: 0, type: 'grass' }],
    });
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(cityMap);

    const result = await useCase.execute();

    expect(result).toEqual({ width: 40, height: 40, backgroundColor: '#7bc96f' });
  });
});
