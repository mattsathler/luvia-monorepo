import { NotFoundException } from '@nestjs/common';
import { GetCurrentLotUseCase } from './get-current-lot.use-case';
import { GetCharacterLotUseCase } from './get-character-lot.use-case';
import { CharacterRepository } from '../../../character/domain/repositories/character.repository';
import { Character } from '../../../character/domain/entities/character.entity';
import { Lot } from '../../domain/entities/lot.entity';

describe('GetCurrentLotUseCase', () => {
  function buildUseCase() {
    const characterRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAccountId: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    } as unknown as jest.Mocked<CharacterRepository>;
    const getCharacterLotUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCharacterLotUseCase>;
    const useCase = new GetCurrentLotUseCase(characterRepository, getCharacterLotUseCase);
    return { useCase, characterRepository, getCharacterLotUseCase };
  }

  function buildCharacter(overrides: Partial<{ activity: Character['activity'] }> = {}): Character {
    return new Character({
      id: 'char-1',
      accountId: 'acc-1',
      firstName: 'Ana',
      lastName: 'Silva',
      happiness: 100,
      energy: 100,
      money: 0,
      fame: 0,
      activity: overrides.activity ?? 'idle',
      activityEndsAt: null,
      lastUpdatedAt: new Date(),
    });
  }

  it('throws when the character does not exist', async () => {
    const { useCase, characterRepository } = buildUseCase();
    characterRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('char-1')).rejects.toThrow(NotFoundException);
  });

  // Só existe lote residencial hoje (ver GetCurrentLotUseCase) — toda
  // atividade resolve nele até emprego/eventos ganharem lotes próprios.
  it.each(['idle', 'resting', 'working'] as const)(
    'resolves to the residential lot, named, while %s',
    async (activity) => {
      const { useCase, characterRepository, getCharacterLotUseCase } = buildUseCase();
      characterRepository.findById.mockResolvedValue(buildCharacter({ activity }));
      getCharacterLotUseCase.execute.mockResolvedValue(
        Lot.create({ characterId: 'char-1', type: 'residential', x: 3, y: 5 }, 'lot-1'),
      );

      const result = await useCase.execute('char-1');

      expect(result).toEqual({ name: 'Residência', x: 3, y: 5 });
      expect(getCharacterLotUseCase.execute).toHaveBeenCalledWith('char-1');
    },
  );
});
