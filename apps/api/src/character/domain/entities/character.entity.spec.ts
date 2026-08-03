import { Character } from './character.entity';

const T0 = new Date('2026-01-01T00:00:00.000Z');

function characterAt(overrides: Partial<Parameters<typeof Character.create>[0]> = {}) {
  return Character.create({ name: 'Ana', ...overrides }, 'char-1', T0);
}

describe('Character.recomputeUntil', () => {
  it('does not change anything when now is not after lastUpdatedAt', () => {
    const character = characterAt();

    const { character: recomputed, previousLastUpdatedAt } = character.recomputeUntil(T0);

    expect(recomputed).toBe(character);
    expect(previousLastUpdatedAt).toEqual(T0);
  });

  it('applies resting effect over the elapsed interval', () => {
    const character = new Character({
      id: 'char-1',
      name: 'Ana',
      happiness: 50,
      energy: 50,
      money: 0,
      fame: 0,
      activity: 'resting',
      activityEndsAt: null,
      lastUpdatedAt: T0,
    });

    const tenMinutesLater = new Date(T0.getTime() + 10 * 60_000);
    const { character: recomputed, previousLastUpdatedAt } = character.recomputeUntil(tenMinutesLater);

    expect(previousLastUpdatedAt).toEqual(T0);
    expect(recomputed.energy).toBe(70); // +2/min * 10min
    expect(recomputed.happiness).toBe(55); // +0.5/min * 10min
    expect(recomputed.lastUpdatedAt).toEqual(tenMinutesLater);
  });

  it('applies working effect over the elapsed interval', () => {
    const character = new Character({
      id: 'char-1',
      name: 'Ana',
      happiness: 50,
      energy: 50,
      money: 0,
      fame: 0,
      activity: 'working',
      activityEndsAt: null,
      lastUpdatedAt: T0,
    });

    const fiveMinutesLater = new Date(T0.getTime() + 5 * 60_000);
    const { character: recomputed } = character.recomputeUntil(fiveMinutesLater);

    expect(recomputed.money).toBe(5); // +1/min * 5min
    expect(recomputed.energy).toBe(45); // -1/min * 5min
  });

  it('does not change stats while idle', () => {
    const character = characterAt();

    const oneHourLater = new Date(T0.getTime() + 60 * 60_000);
    const { character: recomputed } = character.recomputeUntil(oneHourLater);

    expect(recomputed.energy).toBe(character.energy);
    expect(recomputed.happiness).toBe(character.happiness);
    expect(recomputed.activity).toBe('idle');
  });

  it('closes the activity at activityEndsAt and falls back to idle for the remainder', () => {
    const activityEndsAt = new Date(T0.getTime() + 10 * 60_000);
    const character = new Character({
      id: 'char-1',
      name: 'Ana',
      happiness: 50,
      energy: 50,
      money: 0,
      fame: 0,
      activity: 'resting',
      activityEndsAt,
      lastUpdatedAt: T0,
    });

    const thirtyMinutesLater = new Date(T0.getTime() + 30 * 60_000);
    const { character: recomputed } = character.recomputeUntil(thirtyMinutesLater);

    // 10 minutes resting (+2/min energy) then 20 minutes idle (no change)
    expect(recomputed.energy).toBe(70);
    expect(recomputed.activity).toBe('idle');
    expect(recomputed.activityEndsAt).toBeNull();
    expect(recomputed.lastUpdatedAt).toEqual(thirtyMinutesLater);
  });
});

describe('Character.changeActivity', () => {
  it('switches activity and sets a new activityEndsAt', () => {
    const character = characterAt();
    const now = new Date(T0.getTime() + 60_000);
    const endsAt = new Date(now.getTime() + 5 * 60_000);

    const updated = character.changeActivity('working', endsAt, now);

    expect(updated.activity).toBe('working');
    expect(updated.activityEndsAt).toEqual(endsAt);
    expect(updated.lastUpdatedAt).toEqual(now);
  });
});
