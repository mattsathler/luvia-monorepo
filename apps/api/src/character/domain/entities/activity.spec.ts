import { applyActivityEffect } from './activity';

const stats = { happiness: 50, energy: 50, money: 0, fame: 0 };

describe('applyActivityEffect', () => {
  it('returns the same stats unchanged when elapsedMs is zero or negative', () => {
    expect(applyActivityEffect(stats, 'resting', 0)).toBe(stats);
    expect(applyActivityEffect(stats, 'resting', -1000)).toBe(stats);
  });

  it('applies the resting rate over a positive elapsed interval', () => {
    const result = applyActivityEffect(stats, 'resting', 60_000);

    expect(result.energy).toBe(52);
    expect(result.happiness).toBe(50.5);
  });
});
