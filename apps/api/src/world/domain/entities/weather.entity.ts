/**
 * Ver docs/technical/clima-e-temperatura.md. Clima é só cosmético (não afeta
 * jogabilidade nesta fase) e determinístico a partir do `day` do relógio do
 * mundo (ver world-clock.entity.ts) — sem estado próprio, sem persistência:
 * o mesmo dia sempre produz o mesmo clima/temperatura pra todo mundo, como
 * o próprio relógio.
 */
export const WEATHER_TYPES = ['sunny', 'rainy', 'foggy'] as const;
export type WeatherType = (typeof WEATHER_TYPES)[number];

export type Weather = {
  type: WeatherType;
  /** Celsius, inteiro. */
  temperature: number;
};

/**
 * Pesos de sorteio do clima — Luvia é uma cidade chuvosa (ver
 * docs/game-design/city-and-world.md), então chuva é o clima mais comum,
 * não uma opção equiprovável entre as três.
 */
const WEATHER_WEIGHTS: Record<WeatherType, number> = {
  rainy: 0.55,
  sunny: 0.3,
  foggy: 0.15,
};

/** Faixa de temperatura (Celsius) por clima — é o clima que determina a temperatura, não o contrário. */
const TEMPERATURE_RANGES: Record<WeatherType, readonly [number, number]> = {
  sunny: [22, 30],
  rainy: [14, 20],
  foggy: [10, 16],
};

const WEATHER_SEED = 'luvia-weather-v1';

function hash(seed: string): number {
  let h = 0;

  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }

  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;

  return (h >>> 0) / 4294967296;
}

/**
 * Só percorre os tipos até o penúltimo — o último é sempre o "resto" (evita
 * depender da soma de ponto flutuante dos pesos bater exatamente 1).
 */
function pickWeighted(roll: number, weights: Record<WeatherType, number>): WeatherType {
  let cumulative = 0;

  for (const type of WEATHER_TYPES.slice(0, -1)) {
    cumulative += weights[type];
    if (roll < cumulative) {
      return type;
    }
  }

  return WEATHER_TYPES[WEATHER_TYPES.length - 1];
}

/** Determinístico: o mesmo `day` sempre produz o mesmo clima/temperatura. */
export function currentWeather(day: number): Weather {
  const type = pickWeighted(hash(`${WEATHER_SEED}:type:${day}`), WEATHER_WEIGHTS);
  const [min, max] = TEMPERATURE_RANGES[type];
  const temperature = Math.round(min + hash(`${WEATHER_SEED}:temp:${day}`) * (max - min));

  return { type, temperature };
}
