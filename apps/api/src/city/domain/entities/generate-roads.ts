import { RoadGenerationConfig, buildAllRoadTiles } from './road-spines';
import { RawTerrainTile, TerrainTile } from './terrain-tile';

export type { RoadGenerationConfig } from './road-spines';

/**
 * Marca as ruas do mapa (traçado com espaçamento variável e jogs — ver
 * `road-lanes.ts`/`road-spines.ts`) só sobre células que ainda são grama —
 * nunca sobrescreve oceano/praia. As células viram o marcador interno
 * `'road'`; a orientação final (reta, cruzamento ou curva de 90°) só é
 * resolvida depois que os demais passes (água, pontos de interesse) já
 * rodaram, porque eles podem remover vizinhos de uma rua — ver
 * `resolveRoadOrientation` e `city-map.entity.ts`.
 */
export function placeRoads(
  tiles: RawTerrainTile[],
  width: number,
  height: number,
  seed: string,
  config: RoadGenerationConfig = {},
): RawTerrainTile[] {
  const roadTiles = buildAllRoadTiles(width, height, seed, config);

  return tiles.map((tile) => {
    if (tile.type !== 'grass') {
      return tile;
    }

    if (roadTiles.has(`${tile.x}:${tile.y}`)) {
      return { ...tile, type: 'road' };
    }

    return tile;
  });
}

type RoadOrientation = 'road-l' | 'road-r' | 'road-i' | 'road-corner-dr' | 'road-corner-dl' | 'road-corner-lu' | 'road-corner-ru';

function resolveOrientation(left: boolean, right: boolean, up: boolean, down: boolean): RoadOrientation {
  const neighborCount = [left, right, up, down].filter(Boolean).length;
  const horizontal = left || right;
  const vertical = up || down;

  // Cruzamento (4 vizinhos) ou T (3) — nenhum tem sprite dedicado, então
  // reaproveitamos o de cruzamento.
  if (neighborCount >= 3) {
    return 'road-i';
  }

  // Esquina (exatamente 1 horizontal + 1 vertical): curva de 90°, ver
  // packages/luv-ui/src/city/Block/models/TilesTypes.ts — o nome do sprite
  // codifica as duas direções que ele conecta.
  if (horizontal && vertical) {
    if (right && down) return 'road-corner-dr';
    if (right && up) return 'road-corner-ru';
    if (left && down) return 'road-corner-dl';
    return 'road-corner-lu';
  }

  if (horizontal) {
    return right ? 'road-l' : 'road-r';
  }

  if (vertical) {
    return down ? 'road-r' : 'road-l';
  }

  // Tile de rua isolado, sem vizinhos.
  return 'road-r';
}

/**
 * Resolve todo tile marcado como `'road'` pra sua orientação final, olhando
 * os vizinhos já definitivos (depois de água/pontos de interesse terem
 * rodado). Precisa ser o último passe da geração.
 */
export function resolveRoadOrientation(tiles: RawTerrainTile[]): TerrainTile[] {
  const byPosition = new Map(tiles.map((tile) => [`${tile.x}:${tile.y}`, tile]));
  const isRoad = (x: number, y: number) => byPosition.get(`${x}:${y}`)?.type === 'road';

  return tiles.map((tile): TerrainTile => {
    if (tile.type !== 'road') {
      return tile as TerrainTile;
    }

    const left = isRoad(tile.x - 1, tile.y);
    const right = isRoad(tile.x + 1, tile.y);
    const up = isRoad(tile.x, tile.y - 1);
    const down = isRoad(tile.x, tile.y + 1);

    return { x: tile.x, y: tile.y, type: resolveOrientation(left, right, up, down) };
  });
}
