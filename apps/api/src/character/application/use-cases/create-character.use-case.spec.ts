import { CreateCharacterUseCase, CreateCharacterInput } from './create-character.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

function validInput(overrides: Partial<CreateCharacterInput> = {}): CreateCharacterInput {
  return {
    accountId: 'acc-1',
    firstName: 'Ana',
    lastName: 'Silva',
    gender: 'female',
    skinTone: 3,
    hairType: 'curly-1',
    eyeType: 'round-1',
    ...overrides,
  };
}

function buildRepository(): jest.Mocked<CharacterRepository> {
  return {
    save: jest.fn(async (character: Character) => character),
    findById: jest.fn(),
    findByAccountId: jest.fn(),
    trySave: jest.fn(),
    findStaleBatch: jest.fn(),
  };
}

describe('CreateCharacterUseCase', () => {
  it('creates a character with default needs, no skills, and the chosen identity/appearance, saving it via the repository', async () => {
    const characterRepository = buildRepository();
    const useCase = new CreateCharacterUseCase(characterRepository);

    const character = await useCase.execute(validInput());

    expect(character.firstName).toBe('Ana');
    expect(character.lastName).toBe('Silva');
    expect(character.gender).toBe('female');
    expect(character.skills).toEqual({});
    expect(character.appearance).toMatchObject({ skinTone: 3, hairType: 'curly-1', eyeType: 'round-1' });
    expect(character.accountId).toBe('acc-1');
    expect(character.happiness).toBe(100);
    expect(character.energy).toBe(100);
    expect(character.money).toBe(0);
    expect(character.fame).toBe(0);
    expect(characterRepository.save).toHaveBeenCalledWith(character);
  });
});
