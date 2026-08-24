import { generateLanes } from './road-lanes';

describe('generateLanes', () => {
  it('is deterministic — same seed and length always produce the same lanes', () => {
    const first = generateLanes(40, 'seed-a', 'x');
    const second = generateLanes(40, 'seed-a', 'x');

    expect(second).toEqual(first);
  });

  it('produces different lanes for different seeds', () => {
    const a = generateLanes(40, 'seed-a', 'x');
    const b = generateLanes(40, 'seed-b', 'x');

    expect(a).not.toEqual(b);
  });

  it('produces different lanes for different axis labels, even with the same seed', () => {
    const x = generateLanes(40, 'same-seed', 'x');
    const y = generateLanes(40, 'same-seed', 'y');

    expect(x).not.toEqual(y);
  });

  it('starts at position 0 and keeps every lane within [0, length)', () => {
    const lanes = generateLanes(40, 'seed-a', 'x');

    expect(lanes[0].nominalPosition).toBe(0);
    lanes.forEach((lane) => {
      expect(lane.nominalPosition).toBeGreaterThanOrEqual(0);
      expect(lane.nominalPosition).toBeLessThan(40);
    });
  });

  it('keeps the gap between consecutive lanes within [minBlockWidth + 1, maxBlockWidth + 1]', () => {
    const config = { minBlockWidth: 3, maxBlockWidth: 9 };
    const lanes = generateLanes(200, 'seed-a', 'x', config);

    for (let i = 1; i < lanes.length; i++) {
      const gap = lanes[i].nominalPosition - lanes[i - 1].nominalPosition;
      expect(gap).toBeGreaterThanOrEqual(config.minBlockWidth + 1);
      expect(gap).toBeLessThanOrEqual(config.maxBlockWidth + 1);
    }
  });

  it('never returns a negative jogBudget, and caps it at maxJogOffset', () => {
    const config = { minBlockWidth: 3, maxBlockWidth: 9, maxJogOffset: 3 };
    const lanes = generateLanes(200, 'seed-a', 'x', config);

    lanes.forEach((lane) => {
      expect(lane.jogBudget).toBeGreaterThanOrEqual(0);
      expect(lane.jogBudget).toBeLessThanOrEqual(config.maxJogOffset);
    });
  });

  it('gives jogBudget 0 to lanes whose neighbors sit right at the minimum gap', () => {
    // minBlockWidth 0 forces the smallest possible gap (1 tile, just the road
    // itself) to be reachable, which must never leave room for a jog.
    const config = { minBlockWidth: 0, maxBlockWidth: 0, maxJogOffset: 3 };
    const lanes = generateLanes(20, 'seed-a', 'x', config);

    lanes.forEach((lane) => {
      expect(lane.jogBudget).toBe(0);
    });
  });

  it('gives the two ends of a short axis a generous jogBudget when there is only one lane', () => {
    const lanes = generateLanes(2, 'seed-a', 'x', { minBlockWidth: 3, maxBlockWidth: 9, maxJogOffset: 3 });

    expect(lanes).toHaveLength(1);
    expect(lanes[0].jogBudget).toBe(3);
  });
});
