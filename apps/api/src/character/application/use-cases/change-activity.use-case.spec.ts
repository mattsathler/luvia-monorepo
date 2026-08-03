import { ChangeActivityUseCase } from './change-activity.use-case';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

const T0 = new Date('2026-01-01T00:00:00.000Z');

describe('ChangeActivityUseCase', () => {
  it('recomputes the previous activity before saving the new one', async () => {
    const recomputed = new Character({
      id: 'char-1',
      name: 'Ana',
      happiness: 55,
      energy: 70,
      money: 0,
      fame: 0,
      activity: 'resting',
      activityEndsAt: null,
      lastUpdatedAt: T0,
    });

    const recomputeCharacterUseCase = {
      execute: jest.fn(async () => recomputed),
    } as unknown as RecomputeCharacterUseCase;

    const characterRepository: jest.Mocked<CharacterRepository> = {
      save: jest.fn(async (character) => character),
      findById: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    };

    const useCase = new ChangeActivityUseCase(recomputeCharacterUseCase, characterRepository);
    const result = await useCase.execute({ characterId: 'char-1', activity: 'working' });

    expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-1', expect.any(Date));
    expect(result.activity).toBe('working');
    expect(result.energy).toBe(70); // preserves stats computed by the recompute
    expect(characterRepository.save).toHaveBeenCalled();
  });
});
