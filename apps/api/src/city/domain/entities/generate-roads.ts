import { RawTerrainTile, TerrainTile } from './terrain-tile';

/** Ver apps/docs/src/city/ExampleCity.ts — mesmo espaçamento já validado visualmente. */
export const ROAD_SPACING = 6;

/**
 * Marca a grade de ruas (uma a cada `ROAD_SPACING` tiles, ancorada no centro
 * do mapa) só sobre células que ainda são grama — nunca sobrescreve
 * oceano/praia. As células viram o marcador interno `'road'`; a orientação
 * final (reta, cruzamento ou curva de 90°) só é resolvida depois que os
 * demais passes (água, pontos de interesse) já rodaram, porque eles podem
 * remover vizinhos de uma rua — ver `resolveRoadOrientation` e
 * `city-map.entity.ts`.
 *
 * A grade é ancorada em `(mainX, mainY)` — em vez de `x % ROAD_SPACING === 0`
 * — pra garantir um cruzamento exatamente no centro do mapa sem quebrar o
 * espaçamento uniforme ao redor dele. Antes disso, a "rua principal" era uma
 * linha extra e independente da grade (`x === mainX`), o que criava quarteirões
 * disformes sempre que o centro não caía num múltiplo de `ROAD_SPACING` — ex.:
 * em 40x40, a grade absoluta tem ruas em x=18/24, mas o centro é x=20, então
 * sobrava uma fatia de 1 tile de largura entre x=18 e x=20. Ancorando no
 * centro, `mainX`/`mainY` já são a própria linha de grade (distância 0), então
 * todo quarteirão ao redor fica com a mesma largura de `ROAD_SPACING - 1`.
 */
export function placeRoads(tiles: RawTerrainTile[], width: number, height: number): RawTerrainTile[] {
  const mainX = Math.floor(width / 2);
  const mainY = Math.floor(height / 2);

  return tiles.map((tile) => {
    if (tile.type !== 'grass') {
      return tile;
    }

    const isRoadColumn = (tile.x - mainX) % ROAD_SPACING === 0;
    const isRoadRow = (tile.y - mainY) % ROAD_SPACING === 0;

    if (isRoadColumn || isRoadRow) {
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
