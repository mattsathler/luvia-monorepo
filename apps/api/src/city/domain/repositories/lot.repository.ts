import { Lot } from '../entities/lot.entity';

export const LOT_REPOSITORY = Symbol('LOT_REPOSITORY');

export interface LotRepository {
  save(lot: Lot): Promise<Lot>;

  /**
   * Todos os lotes da cidade — usado para renderizar a grade inteira e para
   * calcular a próxima posição livre (ver domain/entities/city-grid.ts).
   */
  findAll(): Promise<Lot[]>;

  findByCharacterId(characterId: string): Promise<Lot | null>;
}
