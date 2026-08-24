import { placeRoads, resolveRoadOrientation } from './generate-roads';
import { MIN_BLOCK_WIDTH } from './road-lanes';
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

/**
 * Ruas formam runs contíguos (o próprio traçado de uma rua) — a regra de
 * espaçamento mínimo só vale ENTRE runs distintos, não dentro de um único
 * traçado. Ver o mesmo helper em road-spines.spec.ts.
 */
function contiguousRuns(sortedPositions: number[]): [number, number][] {
  const runs: [number, number][] = [];
  for (const p of sortedPositions) {
    const last = runs[runs.length - 1];
    if (last && last[1] === p - 1) {
      last[1] = p;
    } else {
      runs.push([p, p]);
    }
  }
  return runs;
}

/** Flood-fill 4-direcional pra verificar que a malha de ruas é um único componente conexo. */
function isRoadNetworkConnected(tiles: RawTerrainTile[], width: number, height: number): boolean {
  const roadKeys = new Set(tiles.filter((t) => t.type === 'road').map((t) => `${t.x}:${t.y}`));
  if (roadKeys.size === 0) return true;

  const start = roadKeys.values().next().value as string;
  const visited = new Set<string>([start]);
  const stack = [start];

  while (stack.length > 0) {
    const key = stack.pop() as string;
    const [x, y] = key.split(':').map(Number);
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      const nKey = `${nx}:${ny}`;
      if (roadKeys.has(nKey) && !visited.has(nKey)) {
        visited.add(nKey);
        stack.push(nKey);
      }
    }
  }

  return visited.size === roadKeys.size;
}

describe('placeRoads', () => {
  it('marks some tiles as road and leaves others as grass', () => {
    const size = 40;
    const result = placeRoads(grid(size, size), size, size, 'seed-a');

    const roadCount = result.filter((t) => t.type === 'road').length;
    expect(roadCount).toBeGreaterThan(0);
    expect(roadCount).toBeLessThan(size * size);
  });

  it('never overwrites a tile that is not grass', () => {
    const size = 14;
    const tiles = grid(size, size);
    const seeded = tiles.map((t) => (t.x === 7 && t.y === 3 ? { ...t, type: 'ocean' as const } : t));

    const withRoads = placeRoads(seeded, size, size, 'seed-a');

    expect(tileAt(withRoads, 7, 3).type).toBe('ocean');
  });

  it('is deterministic — same seed always produces the same road layout', () => {
    const size = 40;
    const first = placeRoads(grid(size, size), size, size, 'seed-a');
    const second = placeRoads(grid(size, size), size, size, 'seed-a');

    expect(second).toEqual(first);
  });

  it('produces a different road layout for a different seed', () => {
    const size = 40;
    const a = placeRoads(grid(size, size), size, size, 'seed-a');
    const b = placeRoads(grid(size, size), size, size, 'seed-b');

    expect(a).not.toEqual(b);
  });

  it('produces blocks of varying width — no longer a uniform lattice', () => {
    const size = 40;
    const result = placeRoads(grid(size, size), size, size, 'seed-a');
    const isRoad = (x: number, y: number) => tileAt(result, x, y).type === 'road';

    // Collect the width of every grass gap between consecutive road runs,
    // across every row — a row that happens to be a horizontal lane's own
    // line (all road, no gaps) contributes nothing, which is fine; enough
    // other rows cross vertical lanes to reveal the block-width variety.
    const gaps = new Set<number>();
    for (let y = 0; y < size; y++) {
      const roadColumns = Array.from({ length: size }, (_, x) => x).filter((x) => isRoad(x, y));
      const runs = contiguousRuns(roadColumns);
      for (let i = 1; i < runs.length; i++) {
        gaps.add(runs[i][0] - runs[i - 1][1] - 1);
      }
    }

    expect(gaps.size).toBeGreaterThan(1);
  });

  it('has at least one lane that jogs (its position varies along its run)', () => {
    // Seed/config combination known to produce a jog within a small grid —
    // if this ever needs to change, any seed works as long as the assertion
    // below (position varies) holds for it.
    const size = 60;
    const result = placeRoads(grid(size, size), size, size, 'seed-a', {
      minBlockWidth: 3,
      maxBlockWidth: 9,
      minJogRun: 3,
      maxJogRun: 6,
      jogProbability: 1,
      maxJogOffset: 3,
    });

    const roadPositionsByRow = new Map<number, number[]>();
    for (const tile of result) {
      if (tile.type !== 'road') continue;
      roadPositionsByRow.set(tile.y, [...(roadPositionsByRow.get(tile.y) ?? []), tile.x]);
    }

    // Group road x-columns that appear consistently across most rows (i.e.
    // that behave like a vertical lane) and check whether any of them
    // actually shifts x at some point instead of staying constant for the
    // whole height — that's a jog.
    const columnPresenceCount = new Map<number, number>();
    roadPositionsByRow.forEach((columns) => {
      columns.forEach((x) => columnPresenceCount.set(x, (columnPresenceCount.get(x) ?? 0) + 1));
    });

    const distinctColumnsUsedAsLanes = [...columnPresenceCount.values()].filter((count) => count > size / 4).length;
    const totalDistinctColumns = columnPresenceCount.size;

    // If no jog ever happened, every vertical lane would occupy exactly one
    // column for the whole height, so the number of "lane-like" columns
    // would equal the number of distinct road columns overall. A jog makes
    // a lane occupy more than one column across its run, so this diverges.
    expect(totalDistinctColumns).toBeGreaterThan(distinctColumnsUsedAsLanes);
  });

  it('keeps at least MIN_BLOCK_WIDTH grass tiles between distinct road runs, on every row and column, across many seeds (40x40)', () => {
    const size = 40;
    const seeds = Array.from({ length: 25 }, (_, i) => `batch-seed-${i}`);

    seeds.forEach((seed) => {
      const result = placeRoads(grid(size, size), size, size, seed);
      const isRoad = (x: number, y: number) => tileAt(result, x, y).type === 'road';

      for (let y = 0; y < size; y++) {
        const roadColumns = Array.from({ length: size }, (_, x) => x).filter((x) => isRoad(x, y));
        const runs = contiguousRuns(roadColumns);
        for (let i = 1; i < runs.length; i++) {
          expect(runs[i][0] - runs[i - 1][1] - 1).toBeGreaterThanOrEqual(MIN_BLOCK_WIDTH);
        }
      }

      for (let x = 0; x < size; x++) {
        const roadRows = Array.from({ length: size }, (_, y) => y).filter((y) => isRoad(x, y));
        const runs = contiguousRuns(roadRows);
        for (let i = 1; i < runs.length; i++) {
          expect(runs[i][0] - runs[i - 1][1] - 1).toBeGreaterThanOrEqual(MIN_BLOCK_WIDTH);
        }
      }
    });
  });

  it('produces a single connected road network, across many seeds (40x40)', () => {
    const size = 40;
    const seeds = Array.from({ length: 25 }, (_, i) => `batch-seed-${i}`);

    seeds.forEach((seed) => {
      const result = placeRoads(grid(size, size), size, size, seed);
      expect(isRoadNetworkConnected(result, size, size)).toBe(true);
    });
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
