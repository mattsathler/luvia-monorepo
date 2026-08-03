import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CHARACTER_REPOSITORY, CharacterRepository } from '../../domain/repositories/character.repository';
import { RecomputeCharacterUseCase } from '../../application/use-cases/recompute-character.use-case';

const INTERVAL_NAME = 'character-tick';

/**
 * Tick em lotes — ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md
 * e docs/technical/simulation-tick.md.
 *
 * Roda periodicamente e recomputa apenas personagens que não foram
 * atualizados recentemente (não recomputados via acesso individual), em
 * páginas, para não processar a base inteira de uma vez.
 */
@Injectable()
export class CharacterTickScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CharacterTickScheduler.name);
  private running = false;

  constructor(
    @Inject(CHARACTER_REPOSITORY)
    private readonly characterRepository: CharacterRepository,
    private readonly recomputeCharacterUseCase: RecomputeCharacterUseCase,
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
        const characters = await this.characterRepository.findStaleBatch(now, batchSize, 0);

        if (characters.length === 0) {
          break;
        }

        await Promise.all(
          characters.map((character) =>
            this.recomputeCharacterUseCase.execute(character.id, now).catch((error) => {
              this.logger.error(`Failed to recompute character ${character.id}`, error);
            }),
          ),
        );

        if (characters.length < batchSize) {
          break;
        }
      }
    } finally {
      this.running = false;
    }
  }
}
