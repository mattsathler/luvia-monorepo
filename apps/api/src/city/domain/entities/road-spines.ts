import { hashNoise2D } from './hash-noise';
import { Lane, LaneConfig, MIN_BLOCK_WIDTH, generateLanes } from './road-lanes';

/**
 * Trecho reto mínimo/máximo (em tiles) entre dois jogs de uma mesma lane.
 * Calibrado pro tamanho real do mapa (CITY_WIDTH/CITY_HEIGHT = 40, ver
 * city-map.entity.ts): valores maiores deixam poucos ou nenhum ponto de
 * quebra dentro de um eixo de 40 tiles, e o traçado acaba saindo reto na
 * prática mesmo com jogs habilitados.
 */
export const MIN_JOG_RUN = 5;
export const MAX_JOG_RUN = 10;
/** Chance de aplicar um jog em cada ponto de quebra elegível. */
export const JOG_PROBABILITY = 0.7;

export type RoadGenerationConfig = LaneConfig & {
  minJogRun?: number;
  maxJogRun?: number;
  jogProbability?: number;
};

type Axis = 'vertical' | 'horizontal';
type Position = { x: number; y: number };

const tileKey = (x: number, y: number): string => `${x}:${y}`;

type SpineConfig = { minJogRun: number; maxJogRun: number; jogProbability: number; minBlockWidth: number };

/**
 * Materializa o traçado de uma lane: trechos retos intercalados por jogs
 * (desvios laterais curtos). O alvo de cada jog é sempre calculado em
 * relação à `nominalPosition` da própria lane — nunca acumulado a partir do
 * offset atual — porque é essa relação com a nominal (não com onde a lane
 * está no momento) que a garantia de espaçamento mínimo em `road-lanes.ts`
 * assume; se os jogs se acumulassem, uma sequência de vários jogs na mesma
 * direção poderia derivar a lane pra além do próprio `jogBudget` e furar a
 * regra de "pelo menos um tile de lote entre ruas paralelas".
 */
function buildSpineTiles(
  lane: Lane,
  axis: Axis,
  runLength: number,
  crossAxisLength: number,
  seed: string,
  oppositeAxisTiles: Set<string>,
  config: SpineConfig,
): Position[] {
  const tiles: Position[] = [];
  let currentOffset = lane.nominalPosition;
  let cursor = 0;
  let breakIndex = 0;

  while (cursor < runLength) {
    const runNoise = hashNoise2D(lane.index, cursor, `${seed}:${axis}:run`);
    const runSpan = config.minJogRun + Math.floor(runNoise * (config.maxJogRun - config.minJogRun + 1));
    const runEnd = Math.min(cursor + runSpan, runLength);

    for (let t = cursor; t < runEnd; t++) {
      tiles.push(axis === 'vertical' ? { x: currentOffset, y: t } : { x: t, y: currentOffset });
    }
    cursor = runEnd;

    if (cursor >= runLength || lane.jogBudget === 0) continue;

    breakIndex++;
    const roll = hashNoise2D(lane.index, breakIndex, `${seed}:${axis}:jog-roll`);
    if (roll > config.jogProbability) continue;

    const jogDelta = 1 + Math.floor(hashNoise2D(lane.index, breakIndex, `${seed}:${axis}:jog-mag`) * lane.jogBudget);
    const direction = hashNoise2D(lane.index, breakIndex, `${seed}:${axis}:jog-dir`) < 0.5 ? -1 : 1;
    const nextOffset = lane.nominalPosition + jogDelta * direction;

    if (nextOffset === currentOffset || nextOffset < 0 || nextOffset >= crossAxisLength) continue;

    const connector = buildConnector(axis, currentOffset, nextOffset, cursor);
    if (!hasClearance(connector, axis, oppositeAxisTiles, tiles, config.minBlockWidth)) continue;

    tiles.push(...connector);
    currentOffset = nextOffset;
    cursor += 1;
  }

  return tiles;
}

function buildConnector(axis: Axis, fromOffset: number, toOffset: number, along: number): Position[] {
  const lo = Math.min(fromOffset, toOffset);
  const hi = Math.max(fromOffset, toOffset);
  const positions: Position[] = [];

  for (let offset = lo; offset <= hi; offset++) {
    positions.push(axis === 'vertical' ? { x: offset, y: along } : { x: along, y: offset });
  }

  return positions;
}

/**
 * Um jog vira, por um tile, um trecho localmente perpendicular ao eixo
 * principal da lane — é o único ponto onde ela corre risco real de furar a
 * regra de espaçamento mínimo contra uma rua do outro eixo. Trechos retos
 * não precisam dessa checagem: a distância entre lanes do MESMO eixo já é
 * garantida pelo `jogBudget`, e um cruzamento perpendicular é só 1 tile
 * (vira `road-i`), nunca fica paralelo.
 *
 * A checagem varre `minBlockWidth` tiles pra cada lado (não só o vizinho
 * imediato): o risco não é só a rua ficar colada (0 tiles de distância) a
 * outra — uma rua que termina bem perto de um cruzamento do outro eixo (ex.:
 * 2 tiles de distância, quando o mínimo exigido é 3) já fura a regra, mesmo
 * sem estarem literalmente grudadas.
 */
function hasClearance(
  connector: Position[],
  axis: Axis,
  oppositeAxisTiles: Set<string>,
  ownTilesSoFar: Position[],
  minBlockWidth: number,
): boolean {
  const own = new Set([...ownTilesSoFar, ...connector].map((t) => tileKey(t.x, t.y)));

  for (const tile of connector) {
    for (let offset = 1; offset <= minBlockWidth; offset++) {
      const neighborKeys =
        axis === 'vertical'
          ? [tileKey(tile.x, tile.y - offset), tileKey(tile.x, tile.y + offset)]
          : [tileKey(tile.x - offset, tile.y), tileKey(tile.x + offset, tile.y)];

      for (const neighborKey of neighborKeys) {
        if (own.has(neighborKey)) continue;
        if (oppositeAxisTiles.has(neighborKey)) return false;
      }
    }
  }

  return true;
}

/**
 * Marca, pra cada lane, não só a própria `nominalPosition` mas a faixa
 * inteira `[nominalPosition - jogBudget, nominalPosition + jogBudget]` —
 * onde essa lane pode realmente acabar depois de um jog. É essa faixa
 * "dilatada" (não a posição nominal sozinha) que serve de referência pra
 * `hasClearance`: se usássemos só a nominal, um conector do eixo oposto
 * poderia passar na checagem por estar longe o bastante da nominal, mas
 * ainda assim ficar perto demais de onde esta lane efetivamente jogou.
 */
function dilatedLaneTiles(lanes: Lane[], laneAxisLength: number, fixedAxisLength: number, laneIsVertical: boolean): Set<string> {
  const tiles = new Set<string>();
  for (const lane of lanes) {
    const from = Math.max(0, lane.nominalPosition - lane.jogBudget);
    const to = Math.min(laneAxisLength - 1, lane.nominalPosition + lane.jogBudget);
    for (let offset = from; offset <= to; offset++) {
      for (let along = 0; along < fixedAxisLength; along++) {
        tiles.add(laneIsVertical ? tileKey(offset, along) : tileKey(along, offset));
      }
    }
  }
  return tiles;
}

/**
 * Gera o conjunto completo de posições de rua do mapa: lanes verticais e
 * horizontais com espaçamento variável (`road-lanes.ts`), cada uma
 * materializada como um traçado que pode ter jogs. As referências de cada
 * eixo (`baseVerticalTiles`/`baseHorizontalTiles`) são calculadas antes de
 * qualquer traçado, dilatadas pelo próprio `jogBudget` de cada lane (ver
 * `dilatedLaneTiles`), e usadas como o pior caso conhecido de antemão contra
 * o qual todo conector é checado — isso resolve tanto a assimetria de
 * processar um eixo inteiro antes do outro quanto o fato de nenhum dos dois
 * eixos conhecer o traçado real (pós-jog) do outro no momento da checagem.
 */
export function buildAllRoadTiles(width: number, height: number, seed: string, config: RoadGenerationConfig = {}): Set<string> {
  const laneConfig: LaneConfig = {
    minBlockWidth: config.minBlockWidth,
    maxBlockWidth: config.maxBlockWidth,
    maxJogOffset: config.maxJogOffset,
  };
  const spineConfig: SpineConfig = {
    minJogRun: config.minJogRun ?? MIN_JOG_RUN,
    maxJogRun: config.maxJogRun ?? MAX_JOG_RUN,
    jogProbability: config.jogProbability ?? JOG_PROBABILITY,
    minBlockWidth: config.minBlockWidth ?? MIN_BLOCK_WIDTH,
  };

  const verticalLanes = generateLanes(width, seed, 'x', laneConfig);
  const horizontalLanes = generateLanes(height, seed, 'y', laneConfig);

  const baseVerticalTiles = dilatedLaneTiles(verticalLanes, width, height, true);
  const baseHorizontalTiles = dilatedLaneTiles(horizontalLanes, height, width, false);

  const allTiles = new Set<string>();
  for (const lane of verticalLanes) {
    buildSpineTiles(lane, 'vertical', height, width, seed, baseHorizontalTiles, spineConfig).forEach((t) => allTiles.add(tileKey(t.x, t.y)));
  }
  for (const lane of horizontalLanes) {
    buildSpineTiles(lane, 'horizontal', width, height, seed, baseVerticalTiles, spineConfig).forEach((t) => allTiles.add(tileKey(t.x, t.y)));
  }

  return allTiles;
}
