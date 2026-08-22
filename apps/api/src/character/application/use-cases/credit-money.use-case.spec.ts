import { NotFoundException } from '@nestjs/common';
import { CreditCharacterMoneyUseCase } from './credit-money.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

describe('CreditCharacterMoneyUseCase', () => {
  function buildUseCase() {
    const characterRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(),
      findByIds: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    } as unknown as jest.Mocked<CharacterRepository>;
    const useCase = new CreditCharacterMoneyUseCase(characterRepository);
    return { useCase, characterRepository };
  }

  function buildCharacter(overrides: Partial<{ money: number; lastUpdatedAt: Date }> = {}): Character {
    return new Character({
      id: 'char-1',
      accountId: 'acc-1',
      firstName: 'Ana',
      lastName: 'Silva',
      happiness: 100,
      energy: 100,
      money: overrides.money ?? 0,
      fame: 0,
      activity: 'working',
      activityEndsAt: null,
      lastUpdatedAt: overrides.lastUpdatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
    });
  }

  it('throws when the character does not exist', async () => {
    const { useCase, characterRepository } = buildUseCase();
    characterRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('char-1', 10)).rejects.toThrow(NotFoundException);
  });

  it('credits the amount and saves via CAS on the first attempt', async () => {
    const { useCase, characterRepository } = buildUseCase();
    const character = buildCharacter({ money: 5 });
    characterRepository.findById.mockResolvedValue(character);
    characterRepository.trySave.mockImplementation(async (updated) => updated);

    const result = await useCase.execute('char-1', 10);

    expect(characterRepository.trySave).toHaveBeenCalledWith(
      expect.objectContaining({ money: 15 }),
      character.lastUpdatedAt,
    );
    expect(result.money).toBe(15);
  });

  it('retries on a CAS conflict, re-reading and re-applying the credit against the current state', async () => {
    const { useCase, characterRepository } = buildUseCase();
    const staleCharacter = buildCharacter({ money: 5, lastUpdatedAt: new Date('2026-01-01T00:00:00.000Z') });
    const currentCharacter = buildCharacter({ money: 20, lastUpdatedAt: new Date('2026-01-01T00:05:00.000Z') });

    characterRepository.findById.mockResolvedValueOnce(staleCharacter).mockResolvedValueOnce(currentCharacter);
    characterRepository.trySave.mockResolvedValueOnce(null).mockImplementationOnce(async (updated) => updated);

    const result = await useCase.execute('char-1', 10);

    expect(characterRepository.trySave).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ money: 15 }),
      staleCharacter.lastUpdatedAt,
    );
    expect(characterRepository.trySave).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ money: 30 }),
      currentCharacter.lastUpdatedAt,
    );
    expect(result.money).toBe(30);
  });

  it('gives up after too many CAS conflicts in a row', async () => {
    const { useCase, characterRepository } = buildUseCase();
    characterRepository.findById.mockResolvedValue(buildCharacter());
    characterRepository.trySave.mockResolvedValue(null);

    await expect(useCase.execute('char-1', 10)).rejects.toThrow('too much contention');
  });
});
