import { placeRoads, resolveRoadOrientation } from './generate-roads';
import { RawTerrainTile } from './terrain-tile';

function grid(width: number, height: number): RawTerrainTile[] {
  const tiles: RawTerrainTile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'grass' });
    }
  }
  return tiles;
}

function tileAt(tiles: RawTerrainTile[], x: number, y: number): RawTerrainTile {
  const tile = tiles.find((t) => t.x === x && t.y === y);
  if (!tile) throw new Error(`no tile at ${x},${y}`);
  return tile;
}

describe('placeRoads', () => {
  const size = 8;
  const result = placeRoads(grid(size, size), size, size);

  it('marks the main road crossing the center', () => {
    expect(tileAt(result, 4, 2).type).toBe('road');
    expect(tileAt(result, 2, 4).type).toBe('road');
  });

  it('marks secondary roads every ROAD_SPACING tiles', () => {
    expect(tileAt(result, 6, 3).type).toBe('road');
  });

  it('leaves tiles away from any road grid line as grass', () => {
    expect(tileAt(result, 2, 2).type).toBe('grass');
  });

  it('never overwrites a tile that is not grass', () => {
    const tiles = grid(size, size);
    const seeded = tiles.map((t) => (t.x === 4 && t.y === 2 ? { ...t, type: 'ocean' as const } : t));

    const withRoads = placeRoads(seeded, size, size);

    expect(tileAt(withRoads, 4, 2).type).toBe('ocean');
  });
});

describe('resolveRoadOrientation', () => {
  function tileWithNeighbors(left: boolean, right: boolean, up: boolean, down: boolean): RawTerrainTile[] {
    const tiles: RawTerrainTile[] = [{ x: 5, y: 5, type: 'road' }];
    if (left) tiles.push({ x: 4, y: 5, type: 'road' });
    if (right) tiles.push({ x: 6, y: 5, type: 'road' });
    if (up) tiles.push({ x: 5, y: 4, type: 'road' });
    if (down) tiles.push({ x: 5, y: 6, type: 'road' });
    return tiles;
  }

  it('resolves a 4-way crossing to road-i', () => {
    const result = resolveRoadOrientation(tileWithNeighbors(true, true, true, true));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe('road-i');
  });

  it('resolves a corner (one horizontal + one vertical neighbor) to road-i', () => {
    const result = resolveRoadOrientation(tileWithNeighbors(true, false, false, true));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe('road-i');
  });

  it('resolves a horizontal-only segment to road-l', () => {
    const result = resolveRoadOrientation(tileWithNeighbors(true, true, false, false));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe('road-l');
  });

  it('resolves a vertical-only segment differently depending on direction (regression: used to always fall back to the isolated default)', () => {
    const downOnly = resolveRoadOrientation(tileWithNeighbors(false, false, false, true));
    const upOnly = resolveRoadOrientation(tileWithNeighbors(false, false, true, false));

    expect(tileAt(downOnly as RawTerrainTile[], 5, 5).type).toBe('road-r');
    expect(tileAt(upOnly as RawTerrainTile[], 5, 5).type).toBe('road-l');
    expect(tileAt(upOnly as RawTerrainTile[], 5, 5).type).not.toBe(tileAt(downOnly as RawTerrainTile[], 5, 5).type);
  });

  it('resolves an isolated road tile with no neighbors to road-r', () => {
    const result = resolveRoadOrientation(tileWithNeighbors(false, false, false, false));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe('road-r');
  });

  it('leaves non-road tiles untouched', () => {
    const result = resolveRoadOrientation([{ x: 1, y: 1, type: 'grass' }]);
    expect(tileAt(result as RawTerrainTile[], 1, 1).type).toBe('grass');
  });
});
