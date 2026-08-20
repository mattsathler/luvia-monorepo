import { placeRoads, resolveRoadOrientation } from './generate-roads';
import { RawTerrainTile, TerrainTile } from './terrain-tile';

/**
 * Algoritmo de geração do terreno da cidade, isolado num arquivo próprio
 * (sem NestJS, sem I/O) pra poder ser rodado fora do app — ver
 * `city/scripts/generate-city-map.script.ts`, que usa esta função direto
 * pra gerar um documento pronto pra colar no Atlas.
 *
 * Ordem dos passes, de propósito:
 * 1. grama em toda a grade;
 * 2. ruas em bruto — só sobre grama restante;
 * 3. orientação final das ruas — por último, já vê a adjacência definitiva.
 *
 * Sem borda de oceano/praia: a cidade não tem um limite de mundo fixo —
 * ver docs/decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa.md.
 *
 * A lagoa (`generate-lake.ts#applyLake`) e os pontos de interesse/prédios
 * públicos (`generate-landmarks.ts#applyLandmarks`) estão temporariamente
 * fora do pipeline — por pedido explícito, tudo grama por enquanto. Os dois
 * passes continuam existindo e testados isoladamente, só não são chamados
 * aqui; pra reativar `applyLandmarks`, basta importar de volta e rodar entre
 * `placeRoads` e `resolveRoadOrientation` (mesma posição de antes — precisa
 * de ruas já colocadas, mas roda antes da orientação final ver a adjacência
 * definitiva). Pra `applyLake`, ver o histórico deste arquivo.
 */
export function generateCityMap(width: number, height: number, seed: string): TerrainTile[] {
  let tiles: RawTerrainTile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'grass' });
    }
  }

  tiles = placeRoads(tiles, width, height);

  return resolveRoadOrientation(tiles);
}
