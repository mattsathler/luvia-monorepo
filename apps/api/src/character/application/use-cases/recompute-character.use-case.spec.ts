import { RecomputeCharacterUseCase } from './recompute-character.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function restingCharacterAt(now: Date) {
  return new Character({
    id: 'char-1',
    accountId: 'acc-1',
    name: 'Ana',
    happiness: 50,
    energy: 50,
    money: 0,
    fame: 0,
    activity: 'resting',
    activityEndsAt: null,
    lastUpdatedAt: now,
  });
}

describe('RecomputeCharacterUseCase', () => {
  it('recomputes the character and saves it via trySave', async () => {
    const character = restingCharacterAt(T0);
    const now = new Date(T0.getTime() + 10 * 60_000);

    const characterRepository: jest.Mocked<CharacterRepository> = {
      save: jest.fn(),
      findById: jest.fn(async (_id: string) => character),
      findByAccountId: jest.fn(),
      trySave: jest.fn(async (updated: Character, _expected: Date) => updated),
      findStaleBatch: jest.fn(),
    };

    const useCase = new RecomputeCharacterUseCase(characterRepository);
    const result = await useCase.execute('char-1', now);

    expect(result.energy).toBe(70);
    expect(characterRepository.trySave).toHaveBeenCalledWith(
      expect.objectContaining({ energy: 70 }),
      T0,
    );
  });

  it('falls back to the current state when trySave loses the race to a concurrent update', async () => {
    const character = restingCharacterAt(T0);
    const now = new Date(T0.getTime() + 10 * 60_000);
    const alreadyUpdated = restingCharacterAt(now);

    const characterRepository: jest.Mocked<CharacterRepository> = {
      save: jest.fn(),
      findById: jest
        .fn()
        .mockResolvedValueOnce(character)
        .mockResolvedValueOnce(alreadyUpdated),
      findByAccountId: jest.fn(),
      trySave: jest.fn(async (_character: Character, _expected: Date) => null),
      findStaleBatch: jest.fn(),
    };

    const useCase = new RecomputeCharacterUseCase(characterRepository);
    const result = await useCase.execute('char-1', now);

    expect(result).toBe(alreadyUpdated);
  });
});
