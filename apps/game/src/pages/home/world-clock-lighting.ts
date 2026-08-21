/**
 * Ver docs/technical/relogio-do-mundo.md. `GAME_MINUTES_PER_REAL_MINUTE`/
 * `GAME_DAY_MINUTES` duplicam apps/api/src/world/domain/entities/world-clock.entity.ts
 * (mesmo valor, sincronizado manualmente — mesmo padrão já usado pra
 * `CHUNK_SIZE`/`TerrainType` entre backend e este app). A fórmula de
 * `applySunLighting` duplica packages/luv-ui/src/city/CycleControl/CycleControl.tsx#DayCycleControl
 * de propósito, em vez de importar/mudar esse componente — ele continua só
 * como slider manual de showcase em apps/docs (mesmo espírito de LOWYS:
 * packages/luv-ui não muda pra acomodar algo específico do jogo).
 */
export const GAME_MINUTES_PER_REAL_MINUTE = 15;
export const GAME_DAY_MINUTES = 24 * 60;

export type WorldClockReference = {
    /** 0–24, fracionário — a hora de jogo no momento de `realTimestamp`. */
    hour: number;
    /** ISO 8601 — instante real (do servidor) em que `hour` foi calculada. */
    realTimestamp: string;
};

/**
 * Hora atual (0–24), extrapolada localmente a partir da última sincronização
 * — evita reconsultar o backend só pra manter a iluminação se movendo
 * suavemente entre polls (ver useWorldClockLighting.ts).
 */
export function extrapolateHour(reference: WorldClockReference, now: number): number {
    const realMinutesElapsed = (now - new Date(reference.realTimestamp).getTime()) / 60_000;
    const gameMinutesElapsed = realMinutesElapsed * GAME_MINUTES_PER_REAL_MINUTE;
    const totalMinutes = reference.hour * 60 + gameMinutesElapsed;
    // Duplo módulo: `now` levemente anterior a `realTimestamp` (corrida entre
    // o timer de extrapolação e a sincronização mais recente) pode deixar
    // `totalMinutes` um pouco negativo — sem isso, `%` sozinho preservaria o
    // sinal negativo em vez de "voltar" pro fim do dia anterior.
    const wrapped = ((totalMinutes % GAME_DAY_MINUTES) + GAME_DAY_MINUTES) % GAME_DAY_MINUTES;

    return wrapped / 60;
}

/** Mesma fórmula de CycleControl.tsx#DayCycleControl. */
export function applySunLighting(hour: number): void {
    const root = document.documentElement;
    const angle = (hour / 24) * Math.PI * 2 - Math.PI;

    const sunX = (Math.sin(angle) + 1) / 2;
    const sunY = Math.max(0, Math.cos(angle));
    const sunset = 1 - sunY;

    const r = 255;
    const g = 220 - sunset * 120;
    const b = 180 - sunset * 150;

    root.style.setProperty("--sun-x", sunX.toString());
    root.style.setProperty("--sun-y", sunY.toString());
    root.style.setProperty("--sun-color", `rgb(${r}, ${g}, ${b})`);
}
