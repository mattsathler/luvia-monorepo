import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { CITY_HEIGHT, CITY_SEED, CITY_WIDTH, CityMap } from '../domain/entities/city-map.entity';
import { TerrainTile } from '../domain/entities/terrain-tile';

export const OUTPUT_PATH = resolve(__dirname, '../../../generated/city-map.json');

export type CityMapDocument = {
  key: 'default';
  width: number;
  height: number;
  seed: string;
  tiles: TerrainTile[];
};

export function buildCityMapDocument(cityMap: CityMap): CityMapDocument {
  return { key: 'default', width: cityMap.width, height: cityMap.height, seed: cityMap.seed, tiles: cityMap.tiles };
}

/**
 * Gera o terreno da cidade e escreve o documento pronto pra colar direto no
 * Atlas (collection `city_maps`, ver docs/technical/api/city/endpoints.md).
 * O cluster de dev é ambiente de testes e pode ser alterado manualmente com
 * frequência enquanto o design do mapa está sendo ajustado — não precisa
 * reiniciar a API nem esperar o `GetOrGenerateCityMapUseCase` regenerar.
 *
 * Rodar com `npm run city:generate` (ver package.json).
 */
export function run(): void {
  const cityMap = CityMap.generate(CITY_WIDTH, CITY_HEIGHT, CITY_SEED);
  const document = buildCityMapDocument(cityMap);

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(document, null, 2)}\n`, 'utf-8');

  // eslint-disable-next-line no-console
  console.log(`Documento da cidade (${document.tiles.length} tiles) gerado em ${OUTPUT_PATH}`);
}

run();
