import { LAKE_JITTER, applyLake, lakeCenter, lakeRadius } from './generate-lake';
import { RawTerrainTile } from './terrain-tile';

const WIDTH = 40;
const HEIGHT = 40;
const SEED = 'test-seed';

function tileAt(tiles: RawTerrainTile[], x: number, y: number): RawTerrainTile {
  const tile = tiles.find((t) => t.x === x && t.y === y);
  if (!tile) throw new Error(`no tile at ${x},${y}`);
  return tile;
}

describe('applyLake', () => {
  it('always marks the lake center as ocean, regardless of the noise jitter', () => {
    const center = lakeCenter(WIDTH, HEIGHT);
    const x = Math.round(center.x);
    const y = Math.round(center.y);
    const tiles: RawTerrainTile[] = [{ x, y, type: 'grass' }];

    const result = applyLake(tiles, WIDTH, HEIGHT, SEED);

    expect(tileAt(result, x, y).type).toBe('ocean');
  });

  it('never marks a tile far beyond the lake radius + max jitter as water', () => {
    const center = lakeCenter(WIDTH, HEIGHT);
    const radius = lakeRadius(WIDTH, HEIGHT);
    const x = Math.round(center.x + radius + LAKE_JITTER + 10);
    const y = Math.round(center.y);
    const tiles: RawTerrainTile[] = [{ x, y, type: 'grass' }];

    const result = applyLake(tiles, WIDTH, HEIGHT, SEED);

    expect(tileAt(result, x, y).type).toBe('grass');
  });

  it('leaves a tile untouched when it is outside the lake', () => {
    const tiles: RawTerrainTile[] = [{ x: 0, y: 0, type: 'road-r' }];

    const result = applyLake(tiles, WIDTH, HEIGHT, SEED);

    expect(tileAt(result, 0, 0).type).toBe('road-r');
  });
});
