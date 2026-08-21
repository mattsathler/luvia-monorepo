import { GAME_DAY_MINUTES, GAME_MINUTES_PER_REAL_MINUTE, WorldClock } from './world-clock.entity';

const EPOCH = new Date('2026-01-01T00:00:00.000Z');

describe('WorldClock', () => {
  it('generate() defaults epoch to now', () => {
    const before = new Date();
    const clock = WorldClock.generate();
    const after = new Date();

    expect(clock.epoch.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(clock.epoch.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('generate() uses the given now as the epoch', () => {
    const clock = WorldClock.generate(EPOCH);

    expect(clock.epoch).toBe(EPOCH);
  });

  it('currentTime() is day 1, hour 0 exactly at the epoch', () => {
    const clock = new WorldClock({ epoch: EPOCH });

    expect(clock.currentTime(EPOCH)).toEqual({ day: 1, hour: 0 });
  });

  it('currentTime() advances one game hour per 4 real minutes (ratio de 15x)', () => {
    const clock = new WorldClock({ epoch: EPOCH });
    const fourRealMinutesLater = new Date(EPOCH.getTime() + 4 * 60_000);

    expect(clock.currentTime(fourRealMinutesLater)).toEqual({ day: 1, hour: 1 });
  });

  it('currentTime() rolls over to day 2 after exactly 96 real minutes (1 game day)', () => {
    const clock = new WorldClock({ epoch: EPOCH });
    const oneGameDayLater = new Date(EPOCH.getTime() + 96 * 60_000);

    expect(clock.currentTime(oneGameDayLater)).toEqual({ day: 2, hour: 0 });
  });

  it('currentTime() keeps rolling over across multiple game days', () => {
    const clock = new WorldClock({ epoch: EPOCH });
    const threeGameDaysAndAHalfLater = new Date(EPOCH.getTime() + 96 * 3.5 * 60_000);

    expect(clock.currentTime(threeGameDaysAndAHalfLater)).toEqual({ day: 4, hour: 12 });
  });

  it('is fully deterministic: same epoch and now always produce the same result', () => {
    const clock = new WorldClock({ epoch: EPOCH });
    const now = new Date(EPOCH.getTime() + 12_345_678);

    expect(clock.currentTime(now)).toEqual(clock.currentTime(now));
  });

  it('GAME_DAY_MINUTES/GAME_MINUTES_PER_REAL_MINUTE encode a 96-real-minute game day', () => {
    expect(GAME_DAY_MINUTES / GAME_MINUTES_PER_REAL_MINUTE).toBe(96);
  });
});
