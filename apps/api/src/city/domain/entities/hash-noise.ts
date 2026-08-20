function stringToSeed(seed: string): number {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 2654435761);
  }

  return hash >>> 0;
}

/**
 * Ruído pseudo-aleatório 2D determinístico (mesma entrada → mesma saída,
 * sempre). Usado pra dar forma orgânica a rios/lagos e espalhar pontos de
 * interesse sem depender de `Math.random()` — a cidade só é gerada uma vez
 * e persistida (ver `city-map.entity.ts`), mas a geração em si continua
 * testável de ponta a ponta.
 */
export function hashNoise2D(x: number, y: number, seed: string): number {
  let h = stringToSeed(seed);
  h = Math.imul(h ^ x, 2246822519);
  h = Math.imul(h ^ y, 3266489917);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489917);
  h ^= h >>> 16;

  return (h >>> 0) / 4294967296;
}
