import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';
import { CityMapRepository } from '../../domain/repositories/city-map.repository';
import { CITY_HEIGHT, CITY_SEED, CITY_WIDTH, CityMap } from '../../domain/entities/city-map.entity';

describe('GetOrGenerateCityMapUseCase', () => {
  function buildUseCase() {
    const cityMapRepository = { find: jest.fn(), save: jest.fn() } as unknown as jest.Mocked<CityMapRepository>;
    const useCase = new GetOrGenerateCityMapUseCase(cityMapRepository);
    return { useCase, cityMapRepository };
  }

  it('returns the existing map when it matches the current seed/dimensions', async () => {
    const { useCase, cityMapRepository } = buildUseCase();
    const existing = new CityMap({ width: CITY_WIDTH, height: CITY_HEIGHT, seed: CITY_SEED, tiles: [] });
    cityMapRepository.find.mockResolvedValue(existing);

    const result = await useCase.execute();

    expect(result).toBe(existing);
    expect(cityMapRepository.save).not.toHaveBeenCalled();
  });

  it('generates and saves a new map when none exists yet', async () => {
    const { useCase, cityMapRepository } = buildUseCase();
    cityMapRepository.find.mockResolvedValue(null);
    cityMapRepository.save.mockImplementation(async (map) => map);

    const result = await useCase.execute();

    expect(result.seed).toBe(CITY_SEED);
    expect(result.width).toBe(CITY_WIDTH);
    expect(cityMapRepository.save).toHaveBeenCalledWith(result);
  });

  it('regenerates when the stored map has a stale seed/dimensions', async () => {
    const { useCase, cityMapRepository } = buildUseCase();
    const stale = new CityMap({ width: CITY_WIDTH, height: CITY_HEIGHT, seed: 'old-seed', tiles: [] });
    cityMapRepository.find.mockResolvedValue(stale);
    cityMapRepository.save.mockImplementation(async (map) => map);

    const result = await useCase.execute();

    expect(result.seed).toBe(CITY_SEED);
    expect(cityMapRepository.save).toHaveBeenCalledWith(result);
  });
});
