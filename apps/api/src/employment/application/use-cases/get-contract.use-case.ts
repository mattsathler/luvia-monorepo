import { Injectable } from '@nestjs/common';
import { Contract } from '../../domain/entities/contract.entity';
import { RecomputeContractUseCase } from './recompute-contract.use-case';

/**
 * Leitura de um Contract sempre passa por recompute primeiro — mesmo padrão
 * de GetCharacterUseCase, ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 */
@Injectable()
export class GetContractUseCase {
  constructor(private readonly recomputeContractUseCase: RecomputeContractUseCase) {}

  async execute(characterId: string): Promise<Contract> {
    return this.recomputeContractUseCase.execute(characterId, new Date());
  }
}
