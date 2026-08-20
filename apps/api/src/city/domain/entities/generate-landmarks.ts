import { hashNoise2D } from './hash-noise';
import { GridPosition, RawTerrainTile } from './terrain-tile';

export const LANDMARK_COUNT = 4;
export const MIN_LANDMARK_SPACING = 5;
const SEARCH_RADIUS = 4;
const ANCHOR_RADIUS_RATIO = 0.28;
const JITTER_RANGE = 6;

function baseAnchors(width: number, height: number, count: number): GridPosition[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * ANCHOR_RADIUS_RATIO;
  const anchors: GridPosition[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    anchors.push({
      x: Math.round(centerX + Math.cos(angle) * radius),
      y: Math.round(centerY + Math.sin(angle) * radius),
    });
  }

  return anchors;
}

function jitterAnchor(anchor: GridPosition, seed: string, index: number): GridPosition {
  const jitterX = Math.round((hashNoise2D(anchor.x, anchor.y, `${seed}:landmark-x:${index}`) - 0.5) * JITTER_RANGE);
  const jitterY = Math.round((hashNoise2D(anchor.x, anchor.y, `${seed}:landmark-y:${index}`) - 0.5) * JITTER_RANGE);

  return { x: anchor.x + jitterX, y: anchor.y + jitterY };
}

function distance(a: GridPosition, b: GridPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Varre em anéis crescentes (até `SEARCH_RADIUS`) a partir de `target` até
 * achar um tile ainda `grass` e a pelo menos `MIN_LANDMARK_SPACING` de
 * qualquer ponto de interesse já posicionado. `null` se nada servir dentro
 * do raio de busca — nesse caso o ponto de interesse é simplesmente
 * descartado (ver `applyLandmarks`).
 */
function findNearestGrass(
  byPosition: Map<string, RawTerrainTile>,
  target: GridPosition,
  taken: GridPosition[],
  width: number,
  height: number,
): GridPosition | null {
  for (let radius = 0; radius <= SEARCH_RADIUS; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) {
          continue;
        }

        const x = target.x + dx;
        const y = target.y + dy;
        if (x < 0 || y < 0 || x >= width || y >= height) {
          continue;
        }

        const tile = byPosition.get(`${x}:${y}`);
        if (!tile || tile.type !== 'grass') {
          continue;
        }

        if (taken.some((position) => distance(position, { x, y }) < MIN_LANDMARK_SPACING)) {
          continue;
        }

        return { x, y };
      }
    }
  }

  return null;
}

/**
 * Espalha `LANDMARK_COUNT` pontos de interesse (prédios públicos) ao redor
 * do centro da grade, com jitter determinístico e espaçamento mínimo entre
 * si. Roda depois de estrada e água, e só reivindica tiles ainda `grass`.
 */
export function applyLandmarks(tiles: RawTerrainTile[], width: number, height: number, seed: string): RawTerrainTile[] {
  const byPosition = new Map(tiles.map((tile) => [`${tile.x}:${tile.y}`, tile]));
  const anchors = baseAnchors(width, height, LANDMARK_COUNT);
  const placed: GridPosition[] = [];

  anchors.forEach((anchor, index) => {
    const target = jitterAnchor(anchor, seed, index);
    const position = findNearestGrass(byPosition, target, placed, width, height);

    if (position) {
      placed.push(position);
    }
  });

  const placedKeys = new Set(placed.map(({ x, y }) => `${x}:${y}`));

  return tiles.map((tile) => (placedKeys.has(`${tile.x}:${tile.y}`) ? { ...tile, type: 'landmark' } : tile));
}
