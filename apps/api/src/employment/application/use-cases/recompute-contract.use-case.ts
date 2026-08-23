import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RecomputeCharacterUseCase } from '../../../character/application/use-cases/recompute-character.use-case';
import { CreditCharacterMoneyUseCase } from '../../../character/application/use-cases/credit-money.use-case';
import { LOT_REPOSITORY, LotRepository } from '../../../city/domain/repositories/lot.repository';
import { WORKPLACE_REPOSITORY, WorkplaceRepository } from '../../../city/domain/repositories/workplace.repository';
import { Contract } from '../../domain/entities/contract.entity';
import { findCargo, nextCargo } from '../../domain/entities/building-catalog';
import { computeEfficiency } from '../../domain/entities/efficiency';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/repositories/contract.repository';

/**
 * Recompute individual sob demanda (lazy tick) do Contract — mesmo padrão de
 * RecomputeCharacterUseCase, ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 * Deve ser chamado antes de qualquer leitura ou atualização de um Contract.
 */
@Injectable()
export class RecomputeContractUseCase {
  constructor(
    private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase,
    private readonly creditCharacterMoneyUseCase: CreditCharacterMoneyUseCase,
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: ContractRepository,
    @Inject(LOT_REPOSITORY)
    private readonly lotRepository: LotRepository,
    @Inject(WORKPLACE_REPOSITORY)
    private readonly workplaceRepository: WorkplaceRepository,
  ) {}

  async execute(characterId: string, now: Date = new Date()): Promise<Contract> {
    const contract = await this.contractRepository.findByCharacterId(characterId);

    if (!contract) {
      throw new NotFoundException(`No active contract for character ${characterId}`);
    }

    const character = await this.recomputeCharacterUseCase.execute(characterId, now);
    const isWorking = character.activity === 'working';
    const efficiency = await this.computeEfficiency(contract, character.skills);

    const { contract: recomputed, previousLastUpdatedAt, moneyEarned, promotionEligible } = contract.recomputeUntil(
      now,
      isWorking,
      efficiency,
    );

    if (recomputed === contract) {
      return contract;
    }

    const toSave = promotionEligible ? await this.applyPromotionIfVacant(recomputed) : recomputed;
    const saved = await this.contractRepository.trySave(toSave, previousLastUpdatedAt);

    if (saved) {
      if (moneyEarned > 0) {
        await this.creditCharacterMoneyUseCase.execute(characterId, moneyEarned);
      }

      return saved;
    }

    // Outro processo (tick em lote ou outro recompute) já processou esse
    // intervalo primeiro — quem venceu a corrida já creditou o dinheiro, não
    // credita de novo aqui.
    const current = await this.contractRepository.findByCharacterId(characterId);
    return current ?? recomputed;
  }

  /**
   * `contract` já cruzou o threshold do cargo atual (`isPromotionEligible()`
   * verdadeiro) — só falta confirmar vaga livre no próximo cargo (ver
   * `CargoDefinition.vacancySlots` e docs/game-design/jobs.md, "vagas
   * limitam promoção"). Sem vaga, retorna o contrato represado no cargo
   * atual — sem perder score, tenta de novo no próximo recompute.
   */
  private async applyPromotionIfVacant(contract: Contract): Promise<Contract> {
    // Invariante do catálogo: isPromotionEligible() só é true quando
    // scoreToPromote não é null, o que sempre implica um próximo cargo (ver
    // building-catalog.ts) — nextCargo nunca é undefined aqui.
    const next = nextCargo(contract.buildingTypeId, contract.cargoId)!;

    if (next.vacancySlots === null) {
      return contract.promote();
    }

    const occupied = await this.contractRepository.countActiveByWorkplaceAndCargo(contract.workplaceId, next.id);
    return occupied < next.vacancySlots ? contract.promote() : contract;
  }

  private async computeEfficiency(contract: Contract, skills: Record<string, number>): Promise<number> {
    const cargo = findCargo(contract.buildingTypeId, contract.cargoId);

    if (!cargo) {
      return 0;
    }

    const [lot, workplace] = await Promise.all([
      this.lotRepository.findByCharacterId(contract.characterId),
      this.workplaceRepository.findById(contract.workplaceId),
    ]);

    if (!workplace) {
      throw new NotFoundException(`Workplace ${contract.workplaceId} not found`);
    }

    return computeEfficiency(skills, cargo, lot, workplace);
  }
}
