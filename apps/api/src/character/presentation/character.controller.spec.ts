import { CharacterController } from './character.controller';
import { CreateCharacterUseCase } from '../application/use-cases/create-character.use-case';
import { GetCharacterUseCase } from '../application/use-cases/get-character.use-case';
import { ListMyCharactersUseCase } from '../application/use-cases/list-my-characters.use-case';
import { ChangeActivityUseCase } from '../application/use-cases/change-activity.use-case';
import { UpdateAppearanceUseCase } from '../application/use-cases/update-appearance.use-case';
import { SKILL_DEFINITIONS } from '../domain/entities/skill';

describe('CharacterController', () => {
  function buildController() {
    const createCharacterUseCase = { execute: jest.fn() } as unknown as jest.Mocked<CreateCharacterUseCase>;
    const getCharacterUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetCharacterUseCase>;
    const listMyCharactersUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ListMyCharactersUseCase>;
    const changeActivityUseCase = { execute: jest.fn() } as unknown as jest.Mocked<ChangeActivityUseCase>;
    const updateAppearanceUseCase = { execute: jest.fn() } as unknown as jest.Mocked<UpdateAppearanceUseCase>;

    const controller = new CharacterController(
      createCharacterUseCase,
      getCharacterUseCase,
      listMyCharactersUseCase,
      changeActivityUseCase,
      updateAppearanceUseCase,
    );

    return {
      controller,
      createCharacterUseCase,
      getCharacterUseCase,
      listMyCharactersUseCase,
      changeActivityUseCase,
      updateAppearanceUseCase,
    };
  }

  it('create() delegates to CreateCharacterUseCase with the current account', () => {
    const { controller, createCharacterUseCase } = buildController();
    createCharacterUseCase.execute.mockResolvedValue('created' as never);

    const result = controller.create('acc-1', {
      firstName: 'Ana',
      lastName: 'Silva',
      gender: 'female',
      skinTone: 3,
      hairType: 'curly-1',
      eyeType: 'round-1',
      skills: { intelligence: 2, charisma: 2 },
    });

    expect(createCharacterUseCase.execute).toHaveBeenCalledWith({
      accountId: 'acc-1',
      firstName: 'Ana',
      lastName: 'Silva',
      gender: 'female',
      skinTone: 3,
      hairType: 'curly-1',
      eyeType: 'round-1',
      skills: { intelligence: 2, charisma: 2 },
    });
    expect(result).resolves.toBe('created');
  });

  it('listSkills() returns the skill catalog', () => {
    const { controller } = buildController();

    expect(controller.listSkills()).toBe(SKILL_DEFINITIONS);
  });

  it('findMine() delegates to ListMyCharactersUseCase with the current account', () => {
    const { controller, listMyCharactersUseCase } = buildController();
    listMyCharactersUseCase.execute.mockResolvedValue([] as never);

    controller.findMine('acc-1');

    expect(listMyCharactersUseCase.execute).toHaveBeenCalledWith('acc-1');
  });

  it('findOne() delegates to GetCharacterUseCase with the id param', () => {
    const { controller, getCharacterUseCase } = buildController();

    controller.findOne('char-1');

    expect(getCharacterUseCase.execute).toHaveBeenCalledWith('char-1');
  });

  it('changeActivity() converts activityEndsAt to a Date and delegates to ChangeActivityUseCase', () => {
    const { controller, changeActivityUseCase } = buildController();

    controller.changeActivity('acc-1', 'char-1', {
      activity: 'working',
      activityEndsAt: '2026-01-01T00:00:00.000Z',
    });

    expect(changeActivityUseCase.execute).toHaveBeenCalledWith({
      characterId: 'char-1',
      accountId: 'acc-1',
      activity: 'working',
      activityEndsAt: new Date('2026-01-01T00:00:00.000Z'),
    });
  });

  it('changeActivity() passes null when activityEndsAt is not provided', () => {
    const { controller, changeActivityUseCase } = buildController();

    controller.changeActivity('acc-1', 'char-1', { activity: 'idle' });

    expect(changeActivityUseCase.execute).toHaveBeenCalledWith({
      characterId: 'char-1',
      accountId: 'acc-1',
      activity: 'idle',
      activityEndsAt: null,
    });
  });

  it('updateAppearance() delegates to UpdateAppearanceUseCase with the current account', () => {
    const { controller, updateAppearanceUseCase } = buildController();

    controller.updateAppearance('acc-1', 'char-1', { skinTone: 5, top: 'blusa-1' });

    expect(updateAppearanceUseCase.execute).toHaveBeenCalledWith({
      characterId: 'char-1',
      accountId: 'acc-1',
      appearance: { skinTone: 5, top: 'blusa-1' },
    });
  });
});
