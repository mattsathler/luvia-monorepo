import { Injectable } from '@nestjs/common';
import { GetOrGenerateWorldClockUseCase } from './get-or-generate-world-clock.use-case';

export type WorldClockView = {
  day: number;
  hour: number;
  /** ISO 8601 — instante real (do servidor) usado pra calcular este `day`/`hour`, pro frontend extrapolar localmente entre sincronizações (ver docs/technical/relogio-do-mundo.md). */
  realTimestamp: string;
};

/**
 * Não recebe nenhum id — existe um relógio de mundo só (ver
 * docs/decisions/0028-relogio-do-mundo-global-sincronizado-do-backend.md),
 * igual pra todos os jogadores.
 */
@Injectable()
export class GetWorldClockUseCase {
  constructor(private readonly getOrGenerateWorldClockUseCase: GetOrGenerateWorldClockUseCase) {}

  async execute(now: Date = new Date()): Promise<WorldClockView> {
    const worldClock = await this.getOrGenerateWorldClockUseCase.execute();
    const { day, hour } = worldClock.currentTime(now);

    return { day, hour, realTimestamp: now.toISOString() };
  }
}
