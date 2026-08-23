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

  /**
   * Quantos `Contract`s ativos já ocupam esse cargo, nessa instância física de
   * prédio (`workplaceId`) — usado por `RecomputeContractUseCase` pra checar
   * vaga livre antes de aplicar uma promoção (ver `CargoDefinition.vacancySlots`
   * em building-catalog.ts e docs/game-design/jobs.md). Note que o próprio
   * contrato sendo promovido ainda está no cargo *atual* nesse momento (a
   * promoção ainda não foi aplicada), então não precisa se excluir da conta.
   */
  countActiveByWorkplaceAndCargo(workplaceId: string, cargoId: string): Promise<number>;
}
