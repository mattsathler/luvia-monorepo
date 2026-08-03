import { GetCharacterUseCase } from './get-character.use-case';
import { RecomputeCharacterUseCase } from './recompute-character.use-case';
import { Character } from '../../domain/entities/character.entity';

describe('GetCharacterUseCase', () => {
  it('delegates to RecomputeCharacterUseCase so every read is up to date', async () => {
    const character = Character.create({ name: 'Ana', accountId: 'acc-1' }, 'char-1');
    const recomputeCharacterUseCase = {
      execute: jest.fn(async () => character),
    } as unknown as RecomputeCharacterUseCase;

    const useCase = new GetCharacterUseCase(recomputeCharacterUseCase);
    const result = await useCase.execute('char-1');

    expect(recomputeCharacterUseCase.execute).toHaveBeenCalledWith('char-1');
    expect(result).toBe(character);
  });
});
