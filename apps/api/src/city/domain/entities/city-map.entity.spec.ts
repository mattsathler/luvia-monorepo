import { CITY_HEIGHT, CITY_SEED, CITY_WIDTH, CityMap, findFreeBuildablePosition } from './city-map.entity';
import { TerrainTile } from './terrain-tile';

describe('CityMap.generate', () => {
  it('produces exactly width * height tiles', () => {
    const map = CityMap.generate(20, 15, 'fixture-seed');

    expect(map.tiles).toHaveLength(20 * 15);
  });

  it('never leaves the internal "road" marker in the final output', () => {
    const map = CityMap.generate(CITY_WIDTH, CITY_HEIGHT, CITY_SEED);

    expect(map.tiles.every((t) => (t.type as string) !== 'road')).toBe(true);
  });

  it('is fully deterministic: generating twice with the same inputs produces identical tiles', () => {
    const first = CityMap.generate(CITY_WIDTH, CITY_HEIGHT, CITY_SEED);
    const second = CityMap.generate(CITY_WIDTH, CITY_HEIGHT, CITY_SEED);

    expect(second.tiles).toEqual(first.tiles);
  });

  it('defaults to CITY_WIDTH/CITY_HEIGHT/CITY_SEED when called with no arguments', () => {
    const map = CityMap.generate();

    expect(map.width).toBe(CITY_WIDTH);
    expect(map.height).toBe(CITY_HEIGHT);
    expect(map.seed).toBe(CITY_SEED);
  });
});

describe('findFreeBuildablePosition', () => {
  const tiles: TerrainTile[] = [
    { x: 0, y: 0, type: 'road-r' },
    { x: 1, y: 0, type: 'ocean' },
    { x: 2, y: 0, type: 'landmark' },
    { x: 3, y: 0, type: 'road-l' },
    { x: 4, y: 0, type: 'grass' },
    { x: 5, y: 0, type: 'grass' },
  ];

  it('skips non-buildable terrain even when it comes first in scan order', () => {
    expect(findFreeBuildablePosition(tiles, [])).toEqual({ x: 4, y: 0 });
  });

  it('skips grass tiles that are already occupied', () => {
    expect(findFreeBuildablePosition(tiles, [{ x: 4, y: 0 }])).toEqual({ x: 5, y: 0 });
  });

  it('returns null when every buildable tile is occupied', () => {
    expect(findFreeBuildablePosition(tiles, [{ x: 4, y: 0 }, { x: 5, y: 0 }])).toBeNull();
  });
});
