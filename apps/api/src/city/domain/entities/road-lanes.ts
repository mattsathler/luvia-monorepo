import { hashNoise2D } from './hash-noise';

/** Tiles de grama entre duas ruas paralelas consecutivas, por padrão — no máximo 4 lotes de largura por quarteirão (1 lote = 1 tile). */
export const MIN_BLOCK_WIDTH = 2;
export const MAX_BLOCK_WIDTH = 4;
/** Deslocamento lateral máximo (em tiles) que um jog pode aplicar a uma lane. */
export const MAX_JOG_OFFSET = 3;

export type Lane = {
  index: number;
  nominalPosition: number;
  jogBudget: number;
};

export type LaneConfig = {
  minBlockWidth?: number;
  maxBlockWidth?: number;
  maxJogOffset?: number;
};

/**
 * Posições nominais de rua ao longo de um eixo (colunas para o eixo `x`,
 * linhas para o eixo `y`), com espaçamento variável entre quarteirões
 * consecutivos — substitui o módulo fixo de `ROAD_SPACING` de antes.
 *
 * `jogBudget` é o quanto esta lane pode se afastar da própria
 * `nominalPosition` (pra qualquer lado) sem correr o risco de furar a regra
 * de "pelo menos um tile de lote entre ruas paralelas": reserva metade da
 * folga acima do mínimo pra cada vizinho, então mesmo no pior caso em que
 * esta lane e a vizinha se afastam cada uma até o próprio limite, uma em
 * direção à outra, a distância residual entre elas nunca cai abaixo de
 * `minBlockWidth + 1` tiles. Ver `road-spines.ts`, que consome esse budget
 * pra decidir o alcance de cada jog sempre relativo à posição nominal (nunca
 * cumulativo) — é essa relação com a nominal, e não com o offset atual, que
 * faz a prova valer mesmo depois de vários jogs em sequência.
 */
export function generateLanes(length: number, seed: string, axisLabel: 'x' | 'y', config: LaneConfig = {}): Lane[] {
  const minBlockWidth = config.minBlockWidth ?? MIN_BLOCK_WIDTH;
  const maxBlockWidth = config.maxBlockWidth ?? MAX_BLOCK_WIDTH;
  const maxJogOffset = config.maxJogOffset ?? MAX_JOG_OFFSET;

  const positions: number[] = [];
  let cursor = 0;
  let i = 0;

  while (cursor < length) {
    positions.push(cursor);
    const noise = hashNoise2D(i, 0, `${seed}:lanes:${axisLabel}`);
    const blockWidth = minBlockWidth + Math.floor(noise * (maxBlockWidth - minBlockWidth + 1));
    cursor += blockWidth + 1;
    i++;
  }

  return positions.map((nominalPosition, index) => {
    const gaps = [
      index > 0 ? nominalPosition - positions[index - 1] : undefined,
      index < positions.length - 1 ? positions[index + 1] - nominalPosition : undefined,
    ].filter((gap): gap is number => gap !== undefined);

    const minGap = gaps.length > 0 ? Math.min(...gaps) : Infinity;
    const jogBudget = Math.max(0, Math.min(maxJogOffset, Math.floor((minGap - (minBlockWidth + 1)) / 2)));

    return { index, nominalPosition, jogBudget };
  });
}
