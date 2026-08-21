import { GetOrGenerateWorldClockUseCase } from './get-or-generate-world-clock.use-case';
import { WorldClockRepository } from '../../domain/repositories/world-clock.repository';
import { WorldClock } from '../../domain/entities/world-clock.entity';

describe('GetOrGenerateWorldClockUseCase', () => {
  function buildUseCase() {
    const worldClockRepository = { find: jest.fn(), save: jest.fn() } as unknown as jest.Mocked<WorldClockRepository>;
    const useCase = new GetOrGenerateWorldClockUseCase(worldClockRepository);
    return { useCase, worldClockRepository };
  }

  it('returns the existing world clock when one is already persisted', async () => {
    const { useCase, worldClockRepository } = buildUseCase();
    const existing = new WorldClock({ epoch: new Date('2026-01-01T00:00:00.000Z') });
    worldClockRepository.find.mockResolvedValue(existing);

    const result = await useCase.execute();

    expect(result).toBe(existing);
    expect(worldClockRepository.save).not.toHaveBeenCalled();
  });

  it('generates and saves a new world clock (epoch = now) when none exists yet', async () => {
    const { useCase, worldClockRepository } = buildUseCase();
    worldClockRepository.find.mockResolvedValue(null);
    worldClockRepository.save.mockImplementation(async (clock) => clock);

    const before = new Date();
    const result = await useCase.execute();
    const after = new Date();

    expect(result.epoch.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.epoch.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(worldClockRepository.save).toHaveBeenCalledWith(result);
  });
});
