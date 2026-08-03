import { CreateCharacterUseCase } from './create-character.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

describe('CreateCharacterUseCase', () => {
  it('creates a character with default needs and saves it via the repository', async () => {
    const characterRepository: jest.Mocked<CharacterRepository> = {
      save: jest.fn(async (character: Character) => character),
      findById: jest.fn(),
      trySave: jest.fn(),
      findStaleBatch: jest.fn(),
    };

    const useCase = new CreateCharacterUseCase(characterRepository);

    const character = await useCase.execute({ name: 'Ana' });

    expect(character.name).toBe('Ana');
    expect(character.happiness).toBe(100);
    expect(character.energy).toBe(100);
    expect(character.money).toBe(0);
    expect(character.fame).toBe(0);
    expect(characterRepository.save).toHaveBeenCalledWith(character);
  });
});
