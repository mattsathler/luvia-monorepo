import { Lot } from './lot.entity';
import { TerrainTile } from './terrain-tile';

/**
 * Tamanho de um chunk (LOWYS — ver docs/technical/lowys-carregamento-em-chunks.md).
 * `CITY_WIDTH`/`CITY_HEIGHT` (city-map.entity.ts) dividem certinho por esse
 * valor hoje (4x4 chunks pra 40x40), mas as funções abaixo não dependem
 * disso — um chunk na borda de uma grade não-múltipla simplesmente devolve
 * menos tiles/lotes, sem erro.
 */
export const CHUNK_SIZE = 10;

function inChunkRange(value: number, chunkIndex: number): boolean {
  const start = chunkIndex * CHUNK_SIZE;
  return value >= start && value < start + CHUNK_SIZE;
}

export function tilesInChunk(tiles: TerrainTile[], chunkX: number, chunkY: number): TerrainTile[] {
  return tiles.filter((tile) => inChunkRange(tile.x, chunkX) && inChunkRange(tile.y, chunkY));
}

export function lotsInChunk(lots: Lot[], chunkX: number, chunkY: number): Lot[] {
  return lots.filter((lot) => inChunkRange(lot.x, chunkX) && inChunkRange(lot.y, chunkY));
}
