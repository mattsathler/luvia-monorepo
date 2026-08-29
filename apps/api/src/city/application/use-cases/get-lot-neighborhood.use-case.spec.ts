import { GetLotNeighborhoodUseCase } from './get-lot-neighborhood.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { WorkplaceRepository } from '../../domain/repositories/workplace.repository';
import { CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { Workplace } from '../../domain/entities/workplace.entity';
import { Character } from '../../../character/domain/entities/character.entity';

describe('GetLotNeighborhoodUseCase', () => {
  function buildUseCase() {
    const lotRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findByCharacterId: jest.fn(),
    } as unknown as jest.Mocked<LotRepository>;
    const workplaceRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<WorkplaceRepository>;
    const characterRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(),
      findByIds: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    } as unknown as jest.Mocked<CharacterRepository>;
    const useCase = new GetLotNeighborhoodUseCase(lotRepository, workplaceRepository, characterRepository);
    return { useCase, lotRepository, workplaceRepository, characterRepository };
  }

  function buildCharacter(overrides: Partial<{ id: string; firstName: string; lastName: string }> = {}): Character {
    return new Character({
      id: overrides.id ?? 'char-1',
      accountId: 'acc-1',
      firstName: overrides.firstName ?? 'Ana',
      lastName: overrides.lastName ?? 'Silva',
      happiness: 100,
      energy: 100,
      money: 0,
      fame: 0,
      activity: 'idle',
      activityEndsAt: null,
      lastUpdatedAt: new Date(),
    });
  }

  it('combines lots and workplaces, sorted by distance from the given position', async () => {
    const { useCase, lotRepository, workplaceRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 5, y: 0 }, 'lot-far')]);
    workplaceRepository.findAll.mockResolvedValue([Workplace.create({ buildingTypeId: 'city-hall', x: 1, y: 0 }, 'wp-near')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter({ id: 'char-1', firstName: 'Ana', lastName: 'Silva' })]);

    const result = await useCase.execute(0, 0);

    expect(result.map((entry) => entry.id)).toEqual(['wp-near', 'lot-far']);
    expect(result[0]).toMatchObject({ kind: 'workplace', buildingTypeId: 'city-hall', distanceBlocks: 1 });
    expect(result[1]).toMatchObject({ kind: 'lot', ownerName: 'Ana Silva', typeName: 'Residência', distanceBlocks: 5 });
  });

  it('excludes the lot itself via excludeLotId', async () => {
    const { useCase, lotRepository, workplaceRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-self')]);
    workplaceRepository.findAll.mockResolvedValue([]);
    characterRepository.findByIds.mockResolvedValue([]);

    const result = await useCase.execute(0, 0, 'lot-self');

    expect(result).toEqual([]);
    expect(characterRepository.findByIds).toHaveBeenCalledWith([]);
  });

  it('falls back to Prefeitura when the lot owner cannot be resolved', async () => {
    const { useCase, lotRepository, workplaceRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 1, y: 0 }, 'lot-1')]);
    workplaceRepository.findAll.mockResolvedValue([]);
    characterRepository.findByIds.mockResolvedValue([]);

    const result = await useCase.execute(0, 0);

    expect(result[0].ownerName).toBe('Prefeitura');
  });

  it('caps the results at the given limit', async () => {
    const { useCase, lotRepository, workplaceRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([
      Lot.create({ characterId: 'char-1', type: 'residential', x: 1, y: 0 }, 'lot-1'),
      Lot.create({ characterId: 'char-2', type: 'residential', x: 2, y: 0 }, 'lot-2'),
      Lot.create({ characterId: 'char-3', type: 'residential', x: 3, y: 0 }, 'lot-3'),
    ]);
    workplaceRepository.findAll.mockResolvedValue([]);
    characterRepository.findByIds.mockResolvedValue([]);

    const result = await useCase.execute(0, 0, undefined, 2);

    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.id)).toEqual(['lot-1', 'lot-2']);
  });
});
