import { CityMap } from '../entities/city-map.entity';

export const CITY_MAP_REPOSITORY = Symbol('CITY_MAP_REPOSITORY');

export interface CityMapRepository {
  /** Existe uma cidade só (ver docs/decisions/0005-cidade-unica-persistente.md) — documento singleton. */
  find(): Promise<CityMap | null>;
  save(cityMap: CityMap): Promise<CityMap>;
}
