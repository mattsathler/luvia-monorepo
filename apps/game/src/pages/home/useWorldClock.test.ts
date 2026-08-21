import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SYNC_INTERVAL_MS, TICK_INTERVAL_MS, useWorldClock } from "./useWorldClock";
import { getWorldClock } from "../../lib/api";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getWorldClock: vi.fn() };
});

const REAL_NOW = new Date("2026-08-20T12:00:00.000Z");

async function flushMicrotasks() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("useWorldClock", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(REAL_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("starts as null before the first sync resolves", () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useWorldClock());

        expect(result.current).toBeNull();
    });

    it("syncs immediately on mount and exposes the synced hour", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            weekday: 3,
            weather: { type: "rainy", temperature: 17 },
            realTimestamp: REAL_NOW.toISOString(),
        });

        const { result } = renderHook(() => useWorldClock());
        await flushMicrotasks();

        expect(getWorldClock).toHaveBeenCalledTimes(1);
        expect(result.current).toEqual({ hour: 10, weekday: 3, weather: { type: "rainy", temperature: 17 } });
    });

    it("ticks the hour forward locally by exactly 1 game-minute per TICK_INTERVAL_MS, without calling the backend again", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            weekday: 3,
            weather: { type: "rainy", temperature: 17 },
            realTimestamp: REAL_NOW.toISOString(),
        });

        const { result } = renderHook(() => useWorldClock());
        await flushMicrotasks();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(TICK_INTERVAL_MS);
        });

        // TICK_INTERVAL_MS = 4s reais = 1 minuto de jogo (ritmo de 15x) = 1/60h.
        expect(result.current?.hour).toBeCloseTo(10 + 1 / 60, 10);
        expect(getWorldClock).not.toHaveBeenCalled();
    });

    it("keeps ticking every TICK_INTERVAL_MS across several ticks", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            weekday: 3,
            weather: { type: "rainy", temperature: 17 },
            realTimestamp: REAL_NOW.toISOString(),
        });

        const { result } = renderHook(() => useWorldClock());
        await flushMicrotasks();

        act(() => {
            vi.advanceTimersByTime(TICK_INTERVAL_MS * 5);
        });

        // 5 minutos de jogo depois.
        expect(result.current?.hour).toBeCloseTo(10 + 5 / 60, 10);
    });

    it("re-syncs with the backend after SYNC_INTERVAL_MS", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            weekday: 3,
            weather: { type: "rainy", temperature: 17 },
            realTimestamp: REAL_NOW.toISOString(),
        });

        renderHook(() => useWorldClock());
        await flushMicrotasks();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(getWorldClock).toHaveBeenCalledTimes(1);
    });

    it("stays null when the fetch fails, and recovers on the next sync", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));

        const { result } = renderHook(() => useWorldClock());
        await flushMicrotasks();

        expect(result.current).toBeNull();

        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            day: 5,
            hour: 8,
            weekday: 4,
            weather: { type: "sunny", temperature: 25 },
            realTimestamp: new Date(REAL_NOW.getTime() + SYNC_INTERVAL_MS).toISOString(),
        });

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(result.current).toEqual({ hour: 8, weekday: 4, weather: { type: "sunny", temperature: 25 } });
    });

    it("ignores a sync that resolves only after the component unmounted", async () => {
        let resolveClock!: (value: {
            day: number;
            hour: number;
            weekday: number;
            weather: { type: "rainy"; temperature: number };
            realTimestamp: string;
        }) => void;
        (getWorldClock as ReturnType<typeof vi.fn>).mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveClock = resolve;
                }),
        );

        const { unmount } = renderHook(() => useWorldClock());
        unmount();

        resolveClock({ day: 5, hour: 10, weekday: 3, weather: { type: "rainy", temperature: 17 }, realTimestamp: REAL_NOW.toISOString() });
        await flushMicrotasks();

        // Não há como observar `result.current` depois do unmount — o teste
        // só garante que resolver a promise tardia não lança/quebra nada.
    });

    it("stops syncing and extrapolating after unmount", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            weekday: 3,
            weather: { type: "rainy", temperature: 17 },
            realTimestamp: REAL_NOW.toISOString(),
        });

        const { unmount } = renderHook(() => useWorldClock());
        await flushMicrotasks();

        unmount();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS + TICK_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(getWorldClock).not.toHaveBeenCalled();
    });
});
