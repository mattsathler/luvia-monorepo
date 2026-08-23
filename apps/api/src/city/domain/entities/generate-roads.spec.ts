import { ROAD_SPACING, placeRoads, resolveRoadOrientation } from './generate-roads';
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
  // Grande o bastante pra ter linhas de grade dos dois lados do centro
  // (mainX/mainY = 7): 1, 7 e 13 — ver comentário de `placeRoads`.
  const size = 14;
  const result = placeRoads(grid(size, size), size, size);

  it('marks a crossing exactly at the center of the map', () => {
    expect(tileAt(result, 7, 3).type).toBe('road');
    expect(tileAt(result, 3, 7).type).toBe('road');
  });

  it('marks secondary roads every ROAD_SPACING tiles, anchored on the center', () => {
    expect(tileAt(result, 1, 3).type).toBe('road');
    expect(tileAt(result, 13, 3).type).toBe('road');
  });

  it('leaves tiles away from any road grid line as grass', () => {
    expect(tileAt(result, 3, 3).type).toBe('grass');
  });

  it('keeps every block the same width — the center never creates a cramped or oversized gap', () => {
    const roadColumns = Array.from({ length: size }, (_, x) => x).filter((x) => tileAt(result, x, 0).type === 'road');

    for (let i = 1; i < roadColumns.length; i++) {
      expect(roadColumns[i] - roadColumns[i - 1]).toBe(ROAD_SPACING);
    }
  });

  it('never overwrites a tile that is not grass', () => {
    const tiles = grid(size, size);
    const seeded = tiles.map((t) => (t.x === 7 && t.y === 3 ? { ...t, type: 'ocean' as const } : t));

    const withRoads = placeRoads(seeded, size, size);

    expect(tileAt(withRoads, 7, 3).type).toBe('ocean');
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

  it('resolves a T (3 neighbors) to road-i, same as a full crossing', () => {
    const result = resolveRoadOrientation(tileWithNeighbors(true, true, true, false));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe('road-i');
  });

  it.each([
    [{ left: false, right: true, up: false, down: true }, 'road-corner-dr'],
    [{ left: true, right: false, up: false, down: true }, 'road-corner-dl'],
    [{ left: true, right: false, up: true, down: false }, 'road-corner-lu'],
    [{ left: false, right: true, up: true, down: false }, 'road-corner-ru'],
  ] as const)('resolves a corner (one horizontal + one vertical neighbor) %o to %s', (neighbors, expected) => {
    const result = resolveRoadOrientation(tileWithNeighbors(neighbors.left, neighbors.right, neighbors.up, neighbors.down));
    expect(tileAt(result as RawTerrainTile[], 5, 5).type).toBe(expected);
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
