import { applyLandmarks } from './generate-landmarks';
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
 * 3. pontos de interesse — só sobre grama restante;
 * 4. orientação final das ruas — por último, já vê a adjacência definitiva.
 *
 * Sem borda de oceano/praia: a cidade não tem um limite de mundo fixo —
 * ver docs/decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa.md.
 *
 * A lagoa (`generate-lake.ts#applyLake`) está temporariamente fora do pipeline
 * — por pedido explícito, pra voltar depois com ajustes. O passe continua
 * existindo e testado isoladamente, só não é chamado aqui por enquanto; pra
 * reativar, basta importar `applyLake` de volta e rodá-lo antes de
 * `placeRoads` (precisa continuar reservando as próprias células antes de
 * qualquer rua existir, já que não modelamos pontes).
 */
export function generateCityMap(width: number, height: number, seed: string): TerrainTile[] {
  let tiles: RawTerrainTile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'grass' });
    }
  }

  tiles = placeRoads(tiles, width, height);
  tiles = applyLandmarks(tiles, width, height, seed);

  return resolveRoadOrientation(tiles);
}
