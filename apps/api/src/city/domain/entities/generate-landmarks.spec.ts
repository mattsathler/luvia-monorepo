import { LANDMARK_COUNT, MIN_LANDMARK_SPACING, applyLandmarks } from './generate-landmarks';
import { RawTerrainTile } from './terrain-tile';

const SEED = 'test-seed';

function grassGrid(width: number, height: number): RawTerrainTile[] {
  const tiles: RawTerrainTile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'grass' });
    }
  }
  return tiles;
}

function landmarksIn(tiles: RawTerrainTile[]) {
  return tiles.filter((tile) => tile.type === 'landmark');
}

describe('applyLandmarks', () => {
  it('places exactly LANDMARK_COUNT landmarks on a fully buildable grid', () => {
    const result = applyLandmarks(grassGrid(40, 40), 40, 40, SEED);

    expect(landmarksIn(result)).toHaveLength(LANDMARK_COUNT);
  });

  it('keeps every pair of landmarks at least MIN_LANDMARK_SPACING apart', () => {
    const result = applyLandmarks(grassGrid(40, 40), 40, 40, SEED);
    const placed = landmarksIn(result);

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const distance = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
        expect(distance).toBeGreaterThanOrEqual(MIN_LANDMARK_SPACING);
      }
    }
  });

  it('keeps every placed landmark at least MIN_LANDMARK_SPACING apart even on a tiny, tightly packed grid', () => {
    const result = applyLandmarks(grassGrid(6, 6), 6, 6, SEED);
    const placed = landmarksIn(result);

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const distance = Math.hypot(placed[i].x - placed[j].x, placed[i].y - placed[j].y);
        expect(distance).toBeGreaterThanOrEqual(MIN_LANDMARK_SPACING);
      }
    }
  });

  it('never turns a non-grass tile into a landmark', () => {
    const tiles = grassGrid(10, 10).map((tile) => ({ ...tile, type: 'road-r' as const }));

    const result = applyLandmarks(tiles, 10, 10, SEED);

    expect(landmarksIn(result)).toHaveLength(0);
  });

  it('leaves every other tile untouched', () => {
    const result = applyLandmarks(grassGrid(40, 40), 40, 40, SEED);
    const untouched = result.filter((tile) => tile.type !== 'landmark');

    expect(untouched.every((tile) => tile.type === 'grass')).toBe(true);
  });
});
