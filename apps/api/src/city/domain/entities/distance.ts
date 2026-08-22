export type GridPosition = { x: number; y: number };

/**
 * Distância em blocos entre duas posições na grade da cidade — mesma
 * convenção de `apps/api/src/employment/domain/entities/efficiency.ts`
 * (cópia deliberada, não importada de lá: `city` nunca depende de
 * `employment`, é o sentido inverso).
 */
export function chebyshevDistance(a: GridPosition, b: GridPosition): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
