import { randomUUID } from 'node:crypto';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RecomputeCharacterUseCase } from '../../../character/application/use-cases/recompute-character.use-case';
import { ChangeActivityUseCase } from '../../../character/application/use-cases/change-activity.use-case';
import { WORKPLACE_REPOSITORY, WorkplaceRepository } from '../../../city/domain/repositories/workplace.repository';
import { Contract } from '../../domain/entities/contract.entity';
import { findBuilding } from '../../domain/entities/building-catalog';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/repositories/contract.repository';
import { RecomputeContractUseCase } from './recompute-contract.use-case';

export type StartContractInput = {
  characterId: string;
  accountId: string;
  workplaceId: string;
};

/**
 * Sempre começa no primeiro cargo da hierarquia do prédio — o cargo nunca é
 * escolhido pelo cliente, fechando um exploit óbvio de pular promoção. Se o
 * personagem já tinha um contrato ativo (troca de emprego), recomputa e
 * substitui: nenhum ganho pendente é descartado (RecomputeContractUseCase já
 * credita o dinheiro antes de sobrescrever), mas não há histórico — só um
 * contrato ativo por personagem. Ver docs/game-design/jobs.md.
 */
@Injectable()
export class StartContractUseCase {
  constructor(
    private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase,
    private readonly recomputeContractUseCase: RecomputeContractUseCase,
    private readonly changeActivityUseCase: ChangeActivityUseCase,
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: ContractRepository,
    @Inject(WORKPLACE_REPOSITORY)
    private readonly workplaceRepository: WorkplaceRepository,
  ) {}

  async execute(input: StartContractInput): Promise<Contract> {
    const now = new Date();
    const character = await this.recomputeCharacterUseCase.execute(input.characterId, now);

    if (character.accountId !== input.accountId) {
      throw new ForbiddenException('You do not own this character');
    }

    const workplace = await this.workplaceRepository.findById(input.workplaceId);
    if (!workplace) {
      throw new NotFoundException(`Workplace ${input.workplaceId} not found`);
    }

    const building = findBuilding(workplace.buildingTypeId);
    if (!building) {
      throw new NotFoundException(`No job catalog entry for building type ${workplace.buildingTypeId}`);
    }

    const existingContract = await this.contractRepository.findByCharacterId(input.characterId);
    if (existingContract) {
      await this.recomputeContractUseCase.execute(input.characterId, now);
    }

    const cargo = building.cargoHierarchy[0];
    const newContract = Contract.start(
      {
        characterId: input.characterId,
        workplaceId: workplace.id,
        buildingTypeId: workplace.buildingTypeId,
        cargoId: cargo.id,
        hourlyWage: cargo.baseHourlyWage,
      },
      randomUUID(),
      now,
    );

    const saved = await this.contractRepository.save(newContract);

    await this.changeActivityUseCase.execute({
      characterId: input.characterId,
      accountId: input.accountId,
      activity: 'working',
      activityEndsAt: null,
    });

    return saved;
  }
}
