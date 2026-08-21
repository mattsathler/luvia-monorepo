import { GetWorldClockUseCase } from './get-world-clock.use-case';
import { GetOrGenerateWorldClockUseCase } from './get-or-generate-world-clock.use-case';
import { WorldClock } from '../../domain/entities/world-clock.entity';

describe('GetWorldClockUseCase', () => {
  function buildUseCase() {
    const getOrGenerateWorldClockUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetOrGenerateWorldClockUseCase>;
    const useCase = new GetWorldClockUseCase(getOrGenerateWorldClockUseCase);
    return { useCase, getOrGenerateWorldClockUseCase };
  }

  it('returns day/hour computed from the world clock, plus the real timestamp used', async () => {
    const { useCase, getOrGenerateWorldClockUseCase } = buildUseCase();
    const epoch = new Date('2026-01-01T00:00:00.000Z');
    getOrGenerateWorldClockUseCase.execute.mockResolvedValue(new WorldClock({ epoch }));
    const now = new Date(epoch.getTime() + 4 * 60_000);

    const result = await useCase.execute(now);

    expect(result).toEqual({ day: 1, hour: 1, realTimestamp: now.toISOString() });
  });

  it('defaults `now` to the current time when not given', async () => {
    const { useCase, getOrGenerateWorldClockUseCase } = buildUseCase();
    const epoch = new Date('2026-01-01T00:00:00.000Z');
    getOrGenerateWorldClockUseCase.execute.mockResolvedValue(new WorldClock({ epoch }));

    const before = new Date();
    const result = await useCase.execute();
    const after = new Date();

    expect(new Date(result.realTimestamp).getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(new Date(result.realTimestamp).getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
