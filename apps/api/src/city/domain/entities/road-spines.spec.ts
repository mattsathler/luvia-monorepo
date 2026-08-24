import { generateLanes } from './road-lanes';
import { buildAllRoadTiles } from './road-spines';

const parse = (key: string): { x: number; y: number } => {
  const [x, y] = key.split(':').map(Number);
  return { x, y };
};

describe('buildAllRoadTiles', () => {
  it('is deterministic — same seed always produces the same tile set', () => {
    const first = buildAllRoadTiles(40, 40, 'seed-a');
    const second = buildAllRoadTiles(40, 40, 'seed-a');

    expect([...second].sort()).toEqual([...first].sort());
  });

  it('produces different tile sets for different seeds', () => {
    const a = buildAllRoadTiles(40, 40, 'seed-a');
    const b = buildAllRoadTiles(40, 40, 'seed-b');

    expect([...a].sort()).not.toEqual([...b].sort());
  });

  it('never places a tile outside the grid bounds', () => {
    const width = 40;
    const height = 40;
    const tiles = buildAllRoadTiles(width, height, 'seed-a');

    tiles.forEach((key) => {
      const { x, y } = parse(key);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(height);
    });
  });

  it('produces a perfectly straight lattice when jogs are disabled (maxJogOffset 0)', () => {
    const width = 40;
    const height = 40;
    const config = { minBlockWidth: 3, maxBlockWidth: 3, maxJogOffset: 0 };
    const tiles = buildAllRoadTiles(width, height, 'seed-a', config);

    const verticalLanes = generateLanes(width, 'seed-a', 'x', config);
    const horizontalLanes = generateLanes(height, 'seed-a', 'y', config);
    const expected = new Set<string>();
    for (const lane of verticalLanes) {
      for (let y = 0; y < height; y++) expected.add(`${lane.nominalPosition}:${y}`);
    }
    for (const lane of horizontalLanes) {
      for (let x = 0; x < width; x++) expected.add(`${x}:${lane.nominalPosition}`);
    }

    expect([...tiles].sort()).toEqual([...expected].sort());
  });

  it('produces a different tile set when jogs are enabled vs. disabled, everything else equal', () => {
    const base = { minBlockWidth: 3, maxBlockWidth: 9, minJogRun: 3, maxJogRun: 5, jogProbability: 1 };
    const withoutJogs = buildAllRoadTiles(60, 60, 'seed-a', { ...base, maxJogOffset: 0 });
    const withJogs = buildAllRoadTiles(60, 60, 'seed-a', { ...base, maxJogOffset: 3 });

    expect([...withJogs].sort()).not.toEqual([...withoutJogs].sort());
  });

  /**
   * Agrupa posições ordenadas em runs contíguos — uma rua reta (ou um
   * conector) sempre produz tiles adjacentes (gap 0) dentro do próprio
   * traçado, o que é esperado; a regra de espaçamento mínimo só se aplica
   * ENTRE runs distintos (ruas/traçados diferentes que passam pela mesma
   * linha), não dentro de um único traçado contínuo.
   */
  function contiguousRuns(sortedPositions: number[]): [number, number][] {
    const runs: [number, number][] = [];
    for (const p of sortedPositions) {
      const last = runs[runs.length - 1];
      if (last && last[1] === p - 1) {
        last[1] = p;
      } else {
        runs.push([p, p]);
      }
    }
    return runs;
  }

  it('keeps at least minBlockWidth grass tiles between distinct road runs on the same row/column', () => {
    const width = 60;
    const height = 60;
    const minBlockWidth = 3;
    const config = { minBlockWidth, maxBlockWidth: 6, minJogRun: 3, maxJogRun: 6, jogProbability: 1, maxJogOffset: 3 };
    const tiles = buildAllRoadTiles(width, height, 'seed-a', config);

    for (let y = 0; y < height; y++) {
      const roadColumns = Array.from({ length: width }, (_, x) => x).filter((x) => tiles.has(`${x}:${y}`));
      const runs = contiguousRuns(roadColumns);
      for (let i = 1; i < runs.length; i++) {
        expect(runs[i][0] - runs[i - 1][1] - 1).toBeGreaterThanOrEqual(minBlockWidth);
      }
    }

    for (let x = 0; x < width; x++) {
      const roadRows = Array.from({ length: height }, (_, y) => y).filter((y) => tiles.has(`${x}:${y}`));
      const runs = contiguousRuns(roadRows);
      for (let i = 1; i < runs.length; i++) {
        expect(runs[i][0] - runs[i - 1][1] - 1).toBeGreaterThanOrEqual(minBlockWidth);
      }
    }
  });
});
