import { useEffect, useRef } from "react";
import { getWorldClock } from "../../lib/api";
import { applySunLighting, extrapolateHour, type WorldClockReference } from "./world-clock-lighting";

/** Recalibra com o backend a cada 5min reais — suficiente pra corrigir drift do relógio local sem gerar tráfego à toa (ver docs/technical/relogio-do-mundo.md). */
export const SYNC_INTERVAL_MS = 5 * 60 * 1000;

/** Entre sincronizações, reaplica a iluminação extrapolada a cada 30s reais — suave o bastante pro olho, sem recalcular a cada frame. */
export const EXTRAPOLATE_INTERVAL_MS = 30 * 1000;

/**
 * Sincroniza periodicamente com `GET /world/clock` e aplica a iluminação
 * (`--sun-x`/`--sun-y`/`--sun-color`) globalmente no documento, extrapolando
 * localmente entre sincronizações — ver world-clock-lighting.ts e
 * docs/technical/relogio-do-mundo.md.
 */
export function useWorldClockLighting(): void {
    const referenceRef = useRef<WorldClockReference | null>(null);

    useEffect(() => {
        let cancelled = false;

        function applyExtrapolated() {
            const reference = referenceRef.current;
            if (!reference) {
                return;
            }
            applySunLighting(extrapolateHour(reference, Date.now()));
        }

        async function sync() {
            try {
                const clock = await getWorldClock();
                if (cancelled) {
                    return;
                }
                referenceRef.current = { hour: clock.hour, realTimestamp: clock.realTimestamp };
                applyExtrapolated();
            } catch {
                // Sem relógio sincronizado ainda (ex.: backend fora do ar) —
                // mantém a iluminação como está (fallback estático de
                // Block.scss na primeira vez) até a próxima tentativa.
            }
        }

        void sync();
        const syncId = setInterval(sync, SYNC_INTERVAL_MS);
        const extrapolateId = setInterval(applyExtrapolated, EXTRAPOLATE_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(syncId);
            clearInterval(extrapolateId);
        };
    }, []);
}
