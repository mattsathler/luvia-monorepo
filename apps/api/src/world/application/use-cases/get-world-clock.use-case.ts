import { Injectable } from '@nestjs/common';
import { GetOrGenerateWorldClockUseCase } from './get-or-generate-world-clock.use-case';
import { Weather, currentWeather } from '../../domain/entities/weather.entity';

export type WorldClockView = {
  day: number;
  hour: number;
  /** 0–6, `(day - 1) % 7` — ver WorldClock#currentTime. */
  weekday: number;
  /** Só cosmético nesta fase, não afeta jogabilidade — ver docs/technical/clima-e-temperatura.md. */
  weather: Weather;
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
    const { day, hour, weekday } = worldClock.currentTime(now);

    return { day, hour, weekday, weather: currentWeather(day), realTimestamp: now.toISOString() };
  }
}
