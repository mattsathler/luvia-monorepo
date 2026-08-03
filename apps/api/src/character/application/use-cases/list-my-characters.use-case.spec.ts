import { ListMyCharactersUseCase } from './list-my-characters.use-case';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function characterAt(id: string) {
  return new Character({
    id,
    accountId: 'acc-1',
    name: `Character ${id}`,
    happiness: 100,
    energy: 100,
    money: 0,
    fame: 0,
    activity: 'idle',
    activityEndsAt: null,
    lastUpdatedAt: T0,
  });
}

describe('ListMyCharactersUseCase', () => {
  it('recomputes every character belonging to the account', async () => {
    const characters = [characterAt('char-1'), characterAt('char-2')];

    const characterRepository: jest.Mocked<CharacterRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(async (_accountId: string) => characters),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    };

    const recomputeCharacterUseCase = {
      execute: jest.fn(async (id: string) => characters.find((c) => c.id === id)!),
    } as unknown as RecomputeCharacterUseCase;

    const useCase = new ListMyCharactersUseCase(characterRepository, recomputeCharacterUseCase);
    const result = await useCase.execute('acc-1');

    expect(characterRepository.findByAccountId).toHaveBeenCalledWith('acc-1');
    expect(recomputeCharacterUseCase.execute).toHaveBeenCalledTimes(2);
    expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
    expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-2', expect.any(Date));
    expect(result).toEqual(characters);
  });
});
