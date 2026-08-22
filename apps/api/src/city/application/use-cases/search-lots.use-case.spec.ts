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

  it('resolves every lot with its owner name and friendly type name', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 3, y: 5 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([buildCharacter({ id: 'char-1', firstName: 'Ana', lastName: 'Silva' })]);

    const result = await useCase.execute();

    expect(characterRepository.findByIds).toHaveBeenCalledWith(['char-1']);
    expect(result).toEqual([{ lotId: 'lot-1', typeName: 'Residência', ownerName: 'Ana Silva', x: 3, y: 5 }]);
  });

  it('leaves ownerName empty when the owner cannot be resolved', async () => {
    const { useCase, lotRepository, characterRepository } = buildUseCase();
    lotRepository.findAll.mockResolvedValue([Lot.create({ characterId: 'char-1', type: 'residential', x: 0, y: 0 }, 'lot-1')]);
    characterRepository.findByIds.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result[0].ownerName).toBe('');
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

    expect(result).toEqual([{ lotId: 'lot-1', typeName: 'Residência', ownerName: 'Ana Silva', x: 0, y: 0 }]);
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
