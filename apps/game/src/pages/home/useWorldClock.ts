import { useEffect, useRef, useState } from "react";
import { getWorldClock, type Weather } from "../../lib/api";
import { GAME_MINUTES_PER_REAL_MINUTE, extrapolateHour, type WorldClockReference } from "./world-clock-lighting";

/** Sincroniza com o backend só em períodos mais longos — corrige drift do relógio local (e reflete qualquer ajuste do epoch), não é o que move o ponteiro visualmente (isso é o job local abaixo). */
export const SYNC_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Job local: recalcula e "avança" a hora exibida a cada 1 minuto de jogo —
 * no ritmo de 15x (`GAME_MINUTES_PER_REAL_MINUTE`), 1 minuto de jogo = 4s
 * reais. Roda entre sincronizações, sem depender do backend — ver
 * docs/technical/relogio-do-mundo.md.
 */
export const TICK_INTERVAL_MS = 60_000 / GAME_MINUTES_PER_REAL_MINUTE;

/** Só atualiza na sincronização (ver sync() abaixo) — o job local só avança `hour`, já que nem dia da semana nem clima mudam rápido o bastante pra precisar de extrapolação. */
type DailyState = {
    weekday: number;
    weather: Weather;
};

export type WorldClockState = {
    /** 0–24, fracionário. */
    hour: number;
    /** 0–6, `(day - 1) % 7`. */
    weekday: number;
    /** Só cosmético nesta fase (ver docs/technical/clima-e-temperatura.md). */
    weather: Weather;
};

/**
 * Sincroniza periodicamente com `GET /world/clock` e extrapola localmente
 * entre sincronizações (ver world-clock-lighting.ts e
 * docs/technical/relogio-do-mundo.md). `null` até a primeira sincronização
 * resolver. Fonte única de dados — quem precisar da hora do jogo (HUD,
 * iluminação) usa este hook uma vez e deriva o que precisar, em vez de cada
 * consumidor sincronizar por conta própria.
 */
export function useWorldClock(): WorldClockState | null {
    const referenceRef = useRef<WorldClockReference | null>(null);
    const [hour, setHour] = useState<number | null>(null);
    const [daily, setDaily] = useState<DailyState | null>(null);

    useEffect(() => {
        let cancelled = false;

        function tick() {
            const reference = referenceRef.current;
            if (!reference) {
                return;
            }
            setHour(extrapolateHour(reference, Date.now()));
        }

        async function sync() {
            try {
                const clock = await getWorldClock();
                if (cancelled) {
                    return;
                }
                referenceRef.current = { hour: clock.hour, realTimestamp: clock.realTimestamp };
                setDaily({ weekday: clock.weekday, weather: clock.weather });
                tick();
            } catch {
                // Sem relógio sincronizado ainda (ex.: backend fora do ar) —
                // mantém o último valor conhecido (ou null) até a próxima tentativa.
            }
        }

        void sync();
        const syncId = setInterval(sync, SYNC_INTERVAL_MS);
        const tickId = setInterval(tick, TICK_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(syncId);
            clearInterval(tickId);
        };
    }, []);

    return hour === null || daily === null ? null : { hour, weekday: daily.weekday, weather: daily.weather };
}
