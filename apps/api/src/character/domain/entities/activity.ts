export type Activity = 'idle' | 'resting' | 'working';

export const DEFAULT_ACTIVITY: Activity = 'idle';

export type CharacterStats = {
  happiness: number;
  energy: number;
  money: number;
  fame: number;
};

const MINUTE_MS = 60_000;

/**
 * Taxas por minuto de cada atividade sobre os atributos do personagem.
 * Valores provisórios (placeholder) até o balanceamento de game design ser
 * decidido — ver docs/game-design/wryd-activity-system.md.
 */
/**
 * `working` não tem mais taxa de dinheiro fixa — o dinheiro ganho ao
 * trabalhar agora vem de um Contract (bounded context `employment`, ver
 * docs/game-design/jobs.md), calculado a partir da eficiência do personagem
 * no cargo atual. Sem contrato ativo, trabalhar só custa energia e não rende
 * nada — não é uma regressão, é o comportamento esperado.
 */
const RATES_PER_MINUTE: Record<Activity, Partial<CharacterStats>> = {
  idle: {},
  resting: { energy: 2, happiness: 0.5 },
  working: { energy: -1 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyActivityEffect(stats: CharacterStats, activity: Activity, elapsedMs: number): CharacterStats {
  if (elapsedMs <= 0) {
    return stats;
  }

  const rate = RATES_PER_MINUTE[activity];
  const minutes = elapsedMs / MINUTE_MS;

  return {
    happiness: clamp(stats.happiness + (rate.happiness ?? 0) * minutes, 0, 100),
    energy: clamp(stats.energy + (rate.energy ?? 0) * minutes, 0, 100),
    money: Math.max(0, stats.money + (rate.money ?? 0) * minutes),
    fame: Math.max(0, stats.fame + (rate.fame ?? 0) * minutes),
  };
}
