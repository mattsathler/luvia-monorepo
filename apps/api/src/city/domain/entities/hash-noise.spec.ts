import { hashNoise2D } from './hash-noise';

describe('hashNoise2D', () => {
  it('is deterministic: same input always produces the same output', () => {
    expect(hashNoise2D(12, 34, 'seed-a')).toBe(hashNoise2D(12, 34, 'seed-a'));
  });

  it('always returns a value in [0, 1)', () => {
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const value = hashNoise2D(x, y, 'range-check');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    }
  });

  it('produces a different value for a different position', () => {
    expect(hashNoise2D(1, 1, 'seed-a')).not.toBe(hashNoise2D(2, 1, 'seed-a'));
  });

  it('produces a different value for a different seed', () => {
    expect(hashNoise2D(1, 1, 'seed-a')).not.toBe(hashNoise2D(1, 1, 'seed-b'));
  });
});
