import { GetCityChunkUseCase } from './get-city-chunk.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { CityMap } from '../../domain/entities/city-map.entity';
import { CHUNK_SIZE } from '../../domain/entities/chunk';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

describe('GetCityChunkUseCase', () => {
  function buildUseCase() {
    const lotRepository = { findAll: jest.fn() } as unknown as jest.Mocked<LotRepository>;
    const getOrGenerateCityMapUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetOrGenerateCityMapUseCase>;
    const useCase = new GetCityChunkUseCase(lotRepository, getOrGenerateCityMapUseCase);
    return { useCase, lotRepository, getOrGenerateCityMapUseCase };
  }

  it('returns only the tiles and lots that fall inside the requested chunk', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();

    const tiles = [
      { x: 0, y: 0, type: 'grass' as const },
      { x: CHUNK_SIZE, y: 0, type: 'grass' as const },
    ];
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(
      new CityMap({ width: CHUNK_SIZE * 2, height: CHUNK_SIZE, seed: 'seed', tiles }),
    );

    const lots = [
      Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1'),
      Lot.create({ characterId: 'char-2', type: 'residential', x: CHUNK_SIZE, y: 0 }, 'lot-2'),
    ];
    lotRepository.findAll.mockResolvedValue(lots);

    const result = await useCase.execute(0, 0);

    expect(result).toEqual({ tiles: [tiles[0]], lots: [lots[0]] });
  });

  it('returns empty tiles/lots for a chunk with nothing in it', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();

    getOrGenerateCityMapUseCase.execute.mockResolvedValue(
      new CityMap({ width: CHUNK_SIZE, height: CHUNK_SIZE, seed: 'seed', tiles: [{ x: 0, y: 0, type: 'grass' }] }),
    );
    lotRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(9, 9);

    expect(result).toEqual({ tiles: [], lots: [] });
  });
});
