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
export const CITY_SEED = 'luvia-city-v3';

export type CityMapProps = {
  width: number;
  height: number;
  seed: string;
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
  readonly tiles: TerrainTile[];

  constructor(props: CityMapProps) {
    this.width = props.width;
    this.height = props.height;
    this.seed = props.seed;
    this.tiles = props.tiles;
  }

  /** Delega a geração em si pro algoritmo isolado em `generate-city-map.ts`. */
  static generate(width: number = CITY_WIDTH, height: number = CITY_HEIGHT, seed: string = CITY_SEED): CityMap {
    return new CityMap({ width, height, seed, tiles: generateCityMap(width, height, seed) });
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
