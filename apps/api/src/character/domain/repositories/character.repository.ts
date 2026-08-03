import { Character } from '../entities/character.entity';

export const CHARACTER_REPOSITORY = Symbol('CHARACTER_REPOSITORY');

export interface CharacterRepository {
  save(character: Character): Promise<Character>;
  findById(id: string): Promise<Character | null>;

  /**
   * Todos os personagens de uma conta — ver docs/decisions/0015-multiplos-personagens-por-conta.md.
   */
  findByAccountId(accountId: string): Promise<Character[]>;

  /**
   * Salva um Character recomputado apenas se ninguém mais o atualizou desde
   * `expectedLastUpdatedAt` (concorrência otimista). Retorna `null` se outro
   * processo (tick em lote ou outro recompute) já processou esse intervalo —
   * nesse caso o chamador deve buscar o estado atual em vez de sobrescrevê-lo.
   * Ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
   */
  trySave(character: Character, expectedLastUpdatedAt: Date): Promise<Character | null>;

  /**
   * Busca uma página de personagens cujo lastUpdatedAt é anterior a `olderThan`,
   * para o tick em lote processar sem carregar a base inteira de uma vez.
   */
  findStaleBatch(olderThan: Date, limit: number, skip: number): Promise<Character[]>;
}
