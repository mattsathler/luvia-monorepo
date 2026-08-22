import { Contract } from '../entities/contract.entity';

export const CONTRACT_REPOSITORY = Symbol('CONTRACT_REPOSITORY');

export interface ContractRepository {
  /**
   * Upsert por `characterId` (não por `contractId`): um contrato novo sempre
   * gera um `randomUUID()` novo (sem reaproveitar id do contrato substituído
   * ao trocar de emprego), então upsert por `contractId` nunca bateria com a
   * linha antiga e violaria o índice único de `characterId`.
   */
  save(contract: Contract): Promise<Contract>;

  findById(id: string): Promise<Contract | null>;

  /** Um personagem tem no máximo um contrato ativo por vez. */
  findByCharacterId(characterId: string): Promise<Contract | null>;

  /**
   * Salva um Contract recomputado apenas se ninguém mais o atualizou desde
   * `expectedLastUpdatedAt` (concorrência otimista, mesmo padrão de
   * CharacterRepository.trySave). Casa por `contractId` — nesse caminho o id
   * já é o atual, não está sendo substituído.
   */
  trySave(contract: Contract, expectedLastUpdatedAt: Date): Promise<Contract | null>;

  /**
   * Busca uma página de contratos cujo lastUpdatedAt é anterior a `olderThan`,
   * para o tick em lote (ContractTickScheduler) processar sem carregar a base
   * inteira de uma vez.
   */
  findStaleBatch(olderThan: Date, limit: number, skip: number): Promise<Contract[]>;
}
