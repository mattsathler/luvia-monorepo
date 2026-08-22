import { GetCityChunkUseCase } from './get-city-chunk.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { WorkplaceRepository } from '../../domain/repositories/workplace.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { Workplace } from '../../domain/entities/workplace.entity';
import { CityMap } from '../../domain/entities/city-map.entity';
import { CHUNK_SIZE } from '../../domain/entities/chunk';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

describe('GetCityChunkUseCase', () => {
  function buildUseCase() {
    const lotRepository = { save: jest.fn(), findAll: jest.fn(), findByCharacterId: jest.fn() } as unknown as jest.Mocked<LotRepository>;
    const workplaceRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<WorkplaceRepository>;
    const getOrGenerateCityMapUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetOrGenerateCityMapUseCase>;
    const useCase = new GetCityChunkUseCase(lotRepository, workplaceRepository, getOrGenerateCityMapUseCase);
    return { useCase, lotRepository, workplaceRepository, getOrGenerateCityMapUseCase };
  }

  it('returns only the tiles, lots and workplaces that fall inside the requested chunk', async () => {
    const { useCase, lotRepository, workplaceRepository, getOrGenerateCityMapUseCase } = buildUseCase();

    const tiles = [
      { x: 0, y: 0, type: 'grass' as const },
      { x: CHUNK_SIZE, y: 0, type: 'grass' as const },
    ];
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(
      new CityMap({ width: CHUNK_SIZE * 2, height: CHUNK_SIZE, seed: 'seed', backgroundColor: '#7bc96f', tiles }),
    );

    const lots = [
      Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1'),
      Lot.create({ characterId: 'char-2', type: 'residential', x: CHUNK_SIZE, y: 0 }, 'lot-2'),
    ];
    lotRepository.findAll.mockResolvedValue(lots);

    const workplaces = [
      Workplace.create({ buildingTypeId: 'city-hall', x: 0, y: 0 }, 'workplace-1'),
      Workplace.create({ buildingTypeId: 'hospital', x: CHUNK_SIZE, y: 0 }, 'workplace-2'),
    ];
    workplaceRepository.findAll.mockResolvedValue(workplaces);

    const result = await useCase.execute(0, 0);

    expect(result).toEqual({ tiles: [tiles[0]], lots: [lots[0]], workplaces: [workplaces[0]] });
  });

  it('returns empty tiles/lots/workplaces for a chunk with nothing in it', async () => {
    const { useCase, lotRepository, workplaceRepository, getOrGenerateCityMapUseCase } = buildUseCase();

    getOrGenerateCityMapUseCase.execute.mockResolvedValue(
      new CityMap({ width: CHUNK_SIZE, height: CHUNK_SIZE, seed: 'seed', backgroundColor: '#7bc96f', tiles: [{ x: 0, y: 0, type: 'grass' }] }),
    );
    lotRepository.findAll.mockResolvedValue([]);
    workplaceRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(9, 9);

    expect(result).toEqual({ tiles: [], lots: [], workplaces: [] });
  });
});
