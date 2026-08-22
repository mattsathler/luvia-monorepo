import { SkillPoints } from '../../../character/domain/entities/skill';
import { CargoDefinition } from './building-catalog';

export type GridPosition = { x: number; y: number };

/** Pesos da fórmula de eficiência — ver docs/game-design/jobs.md, seção Eficiência. */
const EFFICIENCY_WEIGHTS = { primary: 0.6, secondary: 0.25, tertiary: 0.15 } as const;

/**
 * Combinação ponderada dos pontos do personagem nas skills do cargo —
 * principal sempre entra, secundária/terciária só se o cargo as definir
 * (skills ausentes no cargo não entram na conta; os pesos das presentes se
 * renormalizam pra somar 1).
 */
export function computeSkillEfficiency(skills: SkillPoints, cargo: CargoDefinition): number {
  const entries: { weight: number; points: number }[] = [
    { weight: EFFICIENCY_WEIGHTS.primary, points: skills[cargo.primarySkillId] ?? 0 },
  ];

  if (cargo.secondarySkillId) {
    entries.push({ weight: EFFICIENCY_WEIGHTS.secondary, points: skills[cargo.secondarySkillId] ?? 0 });
  }

  if (cargo.tertiarySkillId) {
    entries.push({ weight: EFFICIENCY_WEIGHTS.tertiary, points: skills[cargo.tertiarySkillId] ?? 0 });
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);

  return entries.reduce((sum, entry) => sum + (entry.weight / totalWeight) * entry.points, 0);
}

export function chebyshevDistance(a: GridPosition, b: GridPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/**
 * Placeholder: distância em tiles crua entre o lote residencial e o prédio
 * de trabalho — a trocar por distância em Bairros quando
 * docs/decisions/0031-bairros-expansao-do-mundo-sob-demanda.md for
 * implementado (ver docs/technical/bairros-e-expansao-do-mundo.md). `piso`
 * garante que nenhum trabalho vira inviável (Cozy First), só menos
 * vantajoso; sem lote residencial (`lot === null`), assume o pior caso.
 */
const DISTANCE_FLOOR = 0.4;
const DISTANCE_PENALTY_PER_TILE = 0.01;

export function computeDistanceFactor(lot: GridPosition | null, workplace: GridPosition): number {
  if (!lot) {
    return DISTANCE_FLOOR;
  }

  return Math.max(DISTANCE_FLOOR, 1 - chebyshevDistance(lot, workplace) * DISTANCE_PENALTY_PER_TILE);
}

/** eficiência_final = eficiência_skills × fator_distância — ver docs/game-design/jobs.md. */
export function computeEfficiency(
  skills: SkillPoints,
  cargo: CargoDefinition,
  lot: GridPosition | null,
  workplace: GridPosition,
): number {
  return computeSkillEfficiency(skills, cargo) * computeDistanceFactor(lot, workplace);
}
