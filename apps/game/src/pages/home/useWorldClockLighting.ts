import { useEffect } from "react";
import { applySunLighting } from "./world-clock-lighting";

/**
 * Aplica a iluminação (`--sun-x`/`--sun-y`/`--sun-color`) globalmente no
 * documento a partir da hora do relógio do mundo já sincronizada (ver
 * useWorldClock.ts) — `hour` é `null` até a primeira sincronização resolver,
 * e nesse caso a iluminação fica no fallback estático de `Block.scss`.
 */
export function useWorldClockLighting(hour: number | null): void {
    useEffect(() => {
        if (hour !== null) {
            applySunLighting(hour);
        }
    }, [hour]);
}
