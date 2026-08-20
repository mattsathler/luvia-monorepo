export type TerrainKind = 'grass' | 'ocean' | 'road-r' | 'road-l' | 'road-i' | 'landmark';

/**
 * `'road'` é um marcador interno usado só durante a geração — todo tile
 * `'road'` é resolvido para `road-r`/`road-l`/`road-i` antes de a grade sair
 * do domínio (ver `generate-roads.ts#resolveRoadOrientation`). Nenhuma
 * camada fora de `city/domain/entities` deveria ver `'road'`.
 */
export type RawTerrainKind = TerrainKind | 'road';

export type GridPosition = { x: number; y: number };

export type TerrainTile = GridPosition & { type: TerrainKind };
export type RawTerrainTile = GridPosition & { type: RawTerrainKind };

export function isBuildableTerrain(type: TerrainKind): boolean {
  return type === 'grass';
}
