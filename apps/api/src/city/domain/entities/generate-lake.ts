import { hashNoise2D } from './hash-noise';
import { RawTerrainTile } from './terrain-tile';

const LAKE_CENTER_X_RATIO = 0.7;
const LAKE_CENTER_Y_RATIO = 0.65;
const LAKE_RADIUS_RATIO = 0.08;
export const LAKE_JITTER = 1.2;

/** Centro da lagoa — proporcional ao tamanho da grade. */
export function lakeCenter(width: number, height: number): { x: number; y: number } {
  return { x: width * LAKE_CENTER_X_RATIO, y: height * LAKE_CENTER_Y_RATIO };
}

/** Raio base da lagoa (antes do jitter orgânico da borda). */
export function lakeRadius(width: number, height: number): number {
  return Math.min(width, height) * LAKE_RADIUS_RATIO;
}

function isLake(x: number, y: number, width: number, height: number, seed: string): boolean {
  const center = lakeCenter(width, height);
  const radius = lakeRadius(width, height);
  const jitter = (hashNoise2D(x, y, `${seed}:lake`) - 0.5) * 2 * LAKE_JITTER;
  const distance = Math.hypot(x - center.x, y - center.y);

  return distance <= radius + jitter;
}

/**
 * Lagoa (blob com borda irregular, via ruído seedado). Roda antes das ruas
 * de propósito: como não modelamos pontes, a lagoa precisa "reservar" suas
 * células antes de qualquer rua ser desenhada — assim nenhuma rua cruza a
 * água, ela simplesmente não é desenhada onde já existe lagoa (ver
 * `generate-roads.ts#placeRoads`, que só age sobre tiles ainda `grass`).
 */
export function applyLake(tiles: RawTerrainTile[], width: number, height: number, seed: string): RawTerrainTile[] {
  return tiles.map((tile) => {
    if (isLake(tile.x, tile.y, width, height, seed)) {
      return { x: tile.x, y: tile.y, type: 'ocean' };
    }

    return tile;
  });
}
