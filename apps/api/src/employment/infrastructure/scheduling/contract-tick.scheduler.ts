import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CONTRACT_REPOSITORY, ContractRepository } from '../../domain/repositories/contract.repository';
import { RecomputeContractUseCase } from '../../application/use-cases/recompute-contract.use-case';

const INTERVAL_NAME = 'contract-tick';

/**
 * Tick em lotes do Contract — mesmo padrão de CharacterTickScheduler
 * (character), deliberadamente um scheduler separado em vez de uma extensão
 * daquele: é exatamente o isolamento de bounded context que motiva
 * `character` nunca saber que `employment` existe. Ver
 * docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
 */
@Injectable()
export class ContractTickScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ContractTickScheduler.name);
  private running = false;

  constructor(
    @Inject(CONTRACT_REPOSITORY)
    private readonly contractRepository: ContractRepository,
    private readonly recomputeContractUseCase: RecomputeContractUseCase,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    const intervalMs = Number(this.config.get('TICK_INTERVAL_MS') ?? 60_000);
    const interval = setInterval(() => this.runTick(), intervalMs);
    this.schedulerRegistry.addInterval(INTERVAL_NAME, interval);
  }

  onModuleDestroy(): void {
    if (this.schedulerRegistry.doesExist('interval', INTERVAL_NAME)) {
      this.schedulerRegistry.deleteInterval(INTERVAL_NAME);
    }
  }

  async runTick(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    try {
      const batchSize = Number(this.config.get('TICK_BATCH_SIZE') ?? 100);
      const maxBatchesPerRun = Number(this.config.get('TICK_MAX_BATCHES_PER_RUN') ?? 10);
      const now = new Date();

      for (let batch = 0; batch < maxBatchesPerRun; batch++) {
        const contracts = await this.contractRepository.findStaleBatch(now, batchSize, 0);

        if (contracts.length === 0) {
          break;
        }

        await Promise.all(
          contracts.map((contract) =>
            this.recomputeContractUseCase.execute(contract.characterId, now).catch((error) => {
              this.logger.error(`Failed to recompute contract for character ${contract.characterId}`, error);
            }),
          ),
        );

        if (contracts.length < batchSize) {
          break;
        }
      }
    } finally {
      this.running = false;
    }
  }
}
