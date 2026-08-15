import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateAppearanceUseCase } from './update-appearance.use-case';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { Character } from '../../domain/entities/character.entity';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function characterOwnedBy(accountId: string) {
  return Character.create({ firstName: 'Ana', lastName: 'Silva', accountId }, 'char-1', T0);
}

function repositoryWith(character: Character | null): jest.Mocked<CharacterRepository> {
  return {
    save: jest.fn(async (c) => c),
    findById: jest.fn(async (_id: string) => character),
    findByAccountId: jest.fn(),
    trySave: jest.fn(),
    findStaleBatch: jest.fn(),
  };
}

describe('UpdateAppearanceUseCase', () => {
  it('merges the patch into the current appearance and saves it, when the account owns the character', async () => {
    const character = characterOwnedBy('acc-1');
    const characterRepository = repositoryWith(character);

    const useCase = new UpdateAppearanceUseCase(characterRepository);
    const result = await useCase.execute({
      characterId: 'char-1',
      accountId: 'acc-1',
      appearance: { skinTone: 5, accessory: 'chapeu-1' },
    });

    expect(result.appearance).toEqual({
      skinTone: 5,
      hairType: 'default',
      eyeType: 'default',
      face: 'default',
      accessory: 'chapeu-1',
      top: 'default',
      pants: 'default',
      shoes: 'default',
      overlay: 'default',
    });
    expect(characterRepository.save).toHaveBeenCalled();
  });

  it('rejects the change when the requesting account does not own the character', async () => {
    const character = characterOwnedBy('acc-1');
    const characterRepository = repositoryWith(character);

    const useCase = new UpdateAppearanceUseCase(characterRepository);

    await expect(
      useCase.execute({ characterId: 'char-1', accountId: 'acc-2', appearance: { top: 'blusa-1' } }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(characterRepository.save).not.toHaveBeenCalled();
  });

  it('throws when the character does not exist', async () => {
    const characterRepository = repositoryWith(null);

    const useCase = new UpdateAppearanceUseCase(characterRepository);

    await expect(
      useCase.execute({ characterId: 'char-1', accountId: 'acc-1', appearance: {} }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
