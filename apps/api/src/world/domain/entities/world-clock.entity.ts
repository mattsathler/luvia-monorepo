/**
 * Ver docs/technical/relogio-do-mundo.md — 1 dia de jogo (24h) equivale a
 * 96 minutos reais, então 1 minuto real equivale a 15 minutos de jogo.
 */
export const GAME_MINUTES_PER_REAL_MINUTE = 15;
export const GAME_DAY_MINUTES = 24 * 60;

export type WorldClockProps = {
  epoch: Date;
};

export type WorldTime = {
  day: number;
  hour: number;
};

/**
 * O relógio do mundo é único e global (ver docs/decisions/0028), calculado
 * como função pura do tempo real decorrido desde `epoch` — sem tick nem
 * estado incremental (diferente de Character, ver simulation-tick.md):
 * qualquer leitura, a qualquer momento, recalcula o valor a partir do zero.
 */
export class WorldClock {
  readonly epoch: Date;

  constructor(props: WorldClockProps) {
    this.epoch = props.epoch;
  }

  /** `epoch` = agora, por padrão — o dia 1, 0h do jogo começa no instante em que o relógio é gerado pela primeira vez. */
  static generate(now: Date = new Date()): WorldClock {
    return new WorldClock({ epoch: now });
  }

  /** `day` começa em 1; `hour` é fracionário, 0–24 (formato esperado por DayCycleControl). */
  currentTime(now: Date): WorldTime {
    const realMinutesElapsed = (now.getTime() - this.epoch.getTime()) / 60_000;
    const gameMinutesElapsed = realMinutesElapsed * GAME_MINUTES_PER_REAL_MINUTE;
    const day = Math.floor(gameMinutesElapsed / GAME_DAY_MINUTES) + 1;
    const hour = (gameMinutesElapsed % GAME_DAY_MINUTES) / 60;

    return { day, hour };
  }
}
