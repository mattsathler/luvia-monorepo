import { RawTerrainTile, TerrainTile } from './terrain-tile';

/** Ver apps/docs/src/city/ExampleCity.ts — mesmo espaçamento já validado visualmente. */
export const ROAD_SPACING = 6;

/**
 * Marca a grade de ruas (rua principal cruzando o centro + ruas secundárias
 * a cada `ROAD_SPACING` tiles) só sobre células que ainda são grama — nunca
 * sobrescreve oceano/praia. As células viram o marcador interno `'road'`;
 * a orientação final (`road-l`/`road-r`/`road-i`) só é resolvida depois que
 * os demais passes (água, pontos de interesse) já rodaram, porque eles podem
 * remover vizinhos de uma rua — ver `resolveRoadOrientation` e
 * `city-map.entity.ts`.
 */
export function placeRoads(tiles: RawTerrainTile[], width: number, height: number): RawTerrainTile[] {
  const mainX = Math.floor(width / 2);
  const mainY = Math.floor(height / 2);

  return tiles.map((tile) => {
    if (tile.type !== 'grass') {
      return tile;
    }

    const isMainRoad = tile.x === mainX || tile.y === mainY;
    const isSecondaryRoad = tile.x % ROAD_SPACING === 0 || tile.y % ROAD_SPACING === 0;

    if (isMainRoad || isSecondaryRoad) {
      return { ...tile, type: 'road' };
    }

    return tile;
  });
}

function resolveOrientation(left: boolean, right: boolean, up: boolean, down: boolean): 'road-l' | 'road-r' | 'road-i' {
  const neighborCount = [left, right, up, down].filter(Boolean).length;
  const horizontal = left || right;
  const vertical = up || down;

  // Cruzamento (4 vizinhos), esquina (1 horizontal + 1 vertical) ou T —
  // nenhum tem sprite dedicado, então reaproveitamos o de cruzamento.
  if (neighborCount >= 3 || (horizontal && vertical)) {
    return 'road-i';
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
