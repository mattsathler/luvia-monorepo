import { generateCityMap } from './generate-city-map';

const WIDTH = 40;
const HEIGHT = 40;
const SEED = 'test-seed';

function tileAt(tiles: ReturnType<typeof generateCityMap>, x: number, y: number) {
  const tile = tiles.find((t) => t.x === x && t.y === y);
  if (!tile) throw new Error(`no tile at ${x},${y}`);
  return tile;
}

describe('generateCityMap', () => {
  it('produces exactly width * height tiles', () => {
    expect(generateCityMap(20, 15, SEED)).toHaveLength(20 * 15);
  });

  it('never leaves the internal "road" marker in the final output', () => {
    const tiles = generateCityMap(WIDTH, HEIGHT, SEED);

    expect(tiles.every((t) => (t.type as string) !== 'road')).toBe(true);
  });

  it('is fully deterministic: generating twice with the same inputs produces identical tiles', () => {
    expect(generateCityMap(WIDTH, HEIGHT, SEED)).toEqual(generateCityMap(WIDTH, HEIGHT, SEED));
  });

  it('produces no water tiles while the lake pass is temporarily disabled', () => {
    const tiles = generateCityMap(WIDTH, HEIGHT, SEED);

    expect(tiles.some((t) => t.type === 'ocean')).toBe(false);
  });

  it('has no forced world border: the corner is not turned into ocean', () => {
    const tiles = generateCityMap(WIDTH, HEIGHT, SEED);

    expect(tileAt(tiles, 0, 0).type).not.toBe('ocean');
  });

  it('produces no landmark tiles while the landmarks pass is temporarily disabled', () => {
    const tiles = generateCityMap(WIDTH, HEIGHT, SEED);

    expect(tiles.some((t) => t.type === 'landmark')).toBe(false);
  });
});
