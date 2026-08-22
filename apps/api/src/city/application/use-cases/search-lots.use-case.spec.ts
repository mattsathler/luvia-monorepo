import { SearchLotsUseCase } from './search-lots.use-case';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { Lot } from '../../domain/entities/lot.entity';
import { Character } from '../../../character/domain/entities/character.entity';

describe('SearchLotsUseCase', () => {
  function buildUseCase() {
    const lotRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findByCharacterId: jest.fn(),
    } as unknown as jest.Mocked<LotRepository>;
    const characterRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(),
      findByIds: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    } as unknown as jest.Mocked<CharacterRepository>;
    const useCase = new SearchLotsUseCase(lotRepository, characterRepository);
    return { useCase, lotRepository, characterRepository };
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

  it('resolves every lot with its owner name, friendly type name, and a null distance when no characterId is given', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 3, y: 5 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter({ id: 'char-1', firstName: 'Ana', lastName: 'Silva' })]);

    const result = await useCase.execute();

    expect(characterRepository.findByIds).toHaveBeenCalledWith(['char-1']);
    expect(lotRepository.findByCharacterId).not.toHaveBeenCalled();
    expect(result).toEqual([
      { lotId: 'lot-1', typeName: 'Residência', ownerName: 'Ana Silva', x: 3, y: 5, distanceBlocks: null },
    ]);
  });

  it('leaves ownerName empty when the owner cannot be resolved', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result[0].ownerName).toBe('');
  });

  it('by default (no query), sorts results by distance in blocks from the given characterId\'s home lot', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([
      Lot.create({ characterId: 'char-far', type: 'residential', x: 10, y: 0 }, 'lot-far'),
      Lot.create({ characterId: 'char-near', type: 'residential', x: 1, y: 0 }, 'lot-near'),
    ]);
    characterRepository.findByIds.mockResolvedValue([]);
    lotRepository.findByCharacterId.mockResolvedValue(Lot.create({ characterId: 'me', type: 'residential', x: 0, y: 0 }, 'lot-mine'));

    const result = await useCase.execute(undefined, 'me');

    expect(lotRepository.findByCharacterId).toHaveBeenCalledWith('me');
    expect(result.map((lot) => lot.lotId)).toEqual(['lot-near', 'lot-far']);
    expect(result[0].distanceBlocks).toBe(1);
    expect(result[1].distanceBlocks).toBe(10);
  });

  it('keeps the repository order when characterId has no home lot yet', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([
      Lot.create({ characterId: 'char-a', type: 'residential', x: 10, y: 0 }, 'lot-a'),
      Lot.create({ characterId: 'char-b', type: 'residential', x: 1, y: 0 }, 'lot-b'),
    ]);
    characterRepository.findByIds.mockResolvedValue([]);
    lotRepository.findByCharacterId.mockResolvedValue(null);

    const result = await useCase.execute(undefined, 'me');

    expect(result.map((lot) => lot.lotId)).toEqual(['lot-a', 'lot-b']);
    expect(result.every((lot) => lot.distanceBlocks === null)).toBe(true);
  });

  it('sorts by distance before filtering by query', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([
      Lot.create({ characterId: 'char-far', type: 'residential', x: 10, y: 0 }, 'lot-far'),
      Lot.create({ characterId: 'char-near', type: 'residential', x: 1, y: 0 }, 'lot-near'),
    ]);
    characterRepository.findByIds.mockResolvedValue([]);
    lotRepository.findByCharacterId.mockResolvedValue(Lot.create({ characterId: 'me', type: 'residential', x: 0, y: 0 }, 'lot-mine'));

    const result = await useCase.execute('residência', 'me');

    expect(result.map((lot) => lot.lotId)).toEqual(['lot-near', 'lot-far']);
  });

  it('filters case-insensitively by owner name', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([
      Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1'),
      Lot.create({ characterId: 'char-2', type: 'residential', x: 1, y: 1 }, 'lot-2'),
    ]);
    characterRepository.findByIds.mockResolvedValue([
      buildCharacter({ id: 'char-1', firstName: 'Ana', lastName: 'Silva' }),
      buildCharacter({ id: 'char-2', firstName: 'Beto', lastName: 'Souza' }),
    ]);

    const result = await useCase.execute('ana');

    expect(result).toEqual([
      { lotId: 'lot-1', typeName: 'Residência', ownerName: 'Ana Silva', x: 0, y: 0, distanceBlocks: null },
    ]);
  });

  it('filters case-insensitively by the lot type name', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter()]);

    const result = await useCase.execute('RESIDÊN');

    expect(result).toHaveLength(1);
  });

  it('returns nothing when the query matches neither owner nor type', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter()]);

    const result = await useCase.execute('inexistente');

    expect(result).toEqual([]);
  });

  it('treats a blank query the same as no query', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter()]);

    const result = await useCase.execute('   ');

    expect(result).toHaveLength(1);
  });
});
