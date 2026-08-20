import { GetCharacterLotUseCase } from './get-character-lot.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { CityMap } from '../../domain/entities/city-map.entity';
import { TerrainTile } from '../../domain/entities/terrain-tile';
import { GetOrGenerateCityMapUseCase } from './get-or-generate-city-map.use-case';

describe('GetCharacterLotUseCase', () => {
  function buildUseCase() {
    const lotRepository = {
      findByCharacterId: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<LotRepository>;
    const getOrGenerateCityMapUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetOrGenerateCityMapUseCase>;
    const useCase = new GetCharacterLotUseCase(lotRepository, getOrGenerateCityMapUseCase);
    return { useCase, lotRepository, getOrGenerateCityMapUseCase };
  }

  it('returns the existing lot without claiming a new one', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();
    const existing = Lot.create({ characterId: 'char-1', type: 'residential', x: 5, y: 5 }, 'lot-1');
    lotRepository.findByCharacterId.mockResolvedValue(existing);

    const result = await useCase.execute('char-1');

    expect(result).toBe(existing);
    expect(getOrGenerateCityMapUseCase.execute).not.toHaveBeenCalled();
    expect(lotRepository.save).not.toHaveBeenCalled();
  });

  it('claims the first free grass position when the character has no lot yet, skipping non-buildable terrain', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();
    lotRepository.findByCharacterId.mockResolvedValue(null);
    const tiles: TerrainTile[] = [
      { x: 0, y: 0, type: 'road-r' },
      { x: 1, y: 0, type: 'ocean' },
      { x: 2, y: 0, type: 'grass' },
    ];
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(new CityMap({ width: 3, height: 1, seed: 'seed', backgroundColor: '#7bc96f', tiles }));
    lotRepository.findAll.mockResolvedValue([]);
    lotRepository.save.mockImplementation(async (lot) => lot);

    const result = await useCase.execute('char-1');

    expect(result.characterId).toBe('char-1');
    expect(result.type).toBe('residential');
    expect(result.x).toBe(2);
    expect(result.y).toBe(0);
    expect(lotRepository.save).toHaveBeenCalledWith(result);
  });

  it('throws when the city has no free buildable positions left', async () => {
    const { useCase, lotRepository, getOrGenerateCityMapUseCase } = buildUseCase();
    lotRepository.findByCharacterId.mockResolvedValue(null);
    const tiles: TerrainTile[] = [{ x: 0, y: 0, type: 'grass' }];
    getOrGenerateCityMapUseCase.execute.mockResolvedValue(new CityMap({ width: 1, height: 1, seed: 'seed', backgroundColor: '#7bc96f', tiles }));
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-2', type: 'residential', x: 0, y: 0 }, 'lot-2')]);

    await expect(useCase.execute('char-1')).rejects.toThrow('A cidade não tem mais posições livres para lotes residenciais.');
    expect(lotRepository.save).not.toHaveBeenCalled();
  });
});
