import { generateCityMap } from './generate-city-map';
import { GridPosition, TerrainTile, isBuildableTerrain } from './terrain-tile';

/**
 * Ver apps/docs/src/city/City.tsx (`generateCity(40)`) — mesmo tamanho já
 * validado visualmente. Sem borda fixa de oceano/praia nesta versão (ver
 * docs/decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa.md), então 40x40
 * já é todo terreno útil, sem desperdício com anel de borda.
 */
export const CITY_WIDTH = 40;
export const CITY_HEIGHT = 40;
export const CITY_SEED = 'luvia-city-v4';

/**
 * Verde de `packages/luv-ui/src/styles/_colors.scss` (`green`) — mesma
 * duplicação já aceita pra `TerrainKind`/tokens de cor entre backend e
 * frontend. Cor de fundo da cidade fica salva no documento (não fixa no
 * frontend) porque a hipótese é ter cidades com biomas diferentes no futuro
 * (ex.: neve, outono — já existem texturas de tile pra isso em
 * `TILE_TYPES`), cada uma com seu próprio fundo.
 */
export const DEFAULT_BACKGROUND_COLOR = '#7bc96f';

export type CityMapProps = {
  width: number;
  height: number;
  seed: string;
  backgroundColor: string;
  tiles: TerrainTile[];
};

/**
 * O terreno da única cidade do jogo (ver docs/decisions/0005-cidade-unica-persistente.md).
 * Gerado uma vez de forma determinística e depois persistido — ver
 * GetOrGenerateCityMapUseCase.
 */
export class CityMap {
  readonly width: number;
  readonly height: number;
  readonly seed: string;
  readonly backgroundColor: string;
  readonly tiles: TerrainTile[];

  constructor(props: CityMapProps) {
    this.width = props.width;
    this.height = props.height;
    this.seed = props.seed;
    this.backgroundColor = props.backgroundColor;
    this.tiles = props.tiles;
  }

  /** Delega a geração em si pro algoritmo isolado em `generate-city-map.ts`. */
  static generate(
    width: number = CITY_WIDTH,
    height: number = CITY_HEIGHT,
    seed: string = CITY_SEED,
    backgroundColor: string = DEFAULT_BACKGROUND_COLOR,
  ): CityMap {
    return new CityMap({ width, height, seed, backgroundColor, tiles: generateCityMap(width, height, seed) });
  }
}

/**
 * Primeira posição livre (linha a linha) entre os tiles de terreno
 * reivindicáveis (`grass`) que ainda não está em `occupied` — usada pra
 * reivindicar automaticamente o lote residencial de um personagem (ver
 * GetCharacterLotUseCase). `null` se não sobrar nenhuma.
 */
export function findFreeBuildablePosition(tiles: TerrainTile[], occupied: GridPosition[]): GridPosition | null {
  const taken = new Set(occupied.map(({ x, y }) => `${x}:${y}`));
  const free = tiles.find((tile) => isBuildableTerrain(tile.type) && !taken.has(`${tile.x}:${tile.y}`));

  return free ? { x: free.x, y: free.y } : null;
}
