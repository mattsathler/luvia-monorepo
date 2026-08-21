import { WorldController } from './world.controller';
import { GetWorldClockUseCase } from '../application/use-cases/get-world-clock.use-case';

describe('WorldController', () => {
  function buildController() {
    const getWorldClockUseCase = { execute: jest.fn() } as unknown as jest.Mocked<GetWorldClockUseCase>;
    const controller = new WorldController(getWorldClockUseCase);
    return { controller, getWorldClockUseCase };
  }

  it('getClock() delegates to GetWorldClockUseCase', () => {
    const { controller, getWorldClockUseCase } = buildController();
    getWorldClockUseCase.execute.mockResolvedValue('clock' as never);

    const result = controller.getClock();

    expect(getWorldClockUseCase.execute).toHaveBeenCalledWith();
    expect(result).resolves.toBe('clock');
  });
});
