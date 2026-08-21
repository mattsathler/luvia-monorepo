import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EXTRAPOLATE_INTERVAL_MS, SYNC_INTERVAL_MS, useWorldClockLighting } from "./useWorldClockLighting";
import { getWorldClock } from "../../lib/api";
import { applySunLighting } from "./world-clock-lighting";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getWorldClock: vi.fn() };
});

vi.mock("./world-clock-lighting", async () => {
    const actual = await vi.importActual<typeof import("./world-clock-lighting")>("./world-clock-lighting");
    return { ...actual, applySunLighting: vi.fn() };
});

const REAL_NOW = new Date("2026-08-20T12:00:00.000Z");

async function flushMicrotasks() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("useWorldClockLighting", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(REAL_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("syncs immediately on mount and applies the synced hour", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            realTimestamp: REAL_NOW.toISOString(),
        });

        renderHook(() => useWorldClockLighting());
        await flushMicrotasks();

        expect(getWorldClock).toHaveBeenCalledTimes(1);
        expect(applySunLighting).toHaveBeenCalledWith(10);
    });

    it("re-applies the extrapolated hour between syncs, without calling the backend again", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            realTimestamp: REAL_NOW.toISOString(),
        });

        renderHook(() => useWorldClockLighting());
        await flushMicrotasks();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();
        (applySunLighting as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(EXTRAPOLATE_INTERVAL_MS);
        });

        // 30s reais * 15 (ratio) = 450s = 7.5min de jogo = 0.125h.
        expect(applySunLighting).toHaveBeenCalledWith(10.125);
        expect(getWorldClock).not.toHaveBeenCalled();
    });

    it("re-syncs with the backend after SYNC_INTERVAL_MS", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            realTimestamp: REAL_NOW.toISOString(),
        });

        renderHook(() => useWorldClockLighting());
        await flushMicrotasks();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(getWorldClock).toHaveBeenCalledTimes(1);
    });

    it("does not apply lighting when the fetch fails, and recovers on the next sync", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));

        renderHook(() => useWorldClockLighting());
        await flushMicrotasks();

        expect(applySunLighting).not.toHaveBeenCalled();

        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            day: 5,
            hour: 8,
            realTimestamp: new Date(REAL_NOW.getTime() + SYNC_INTERVAL_MS).toISOString(),
        });

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(applySunLighting).toHaveBeenCalledWith(8);
    });

    it("ignores a sync that resolves only after the component unmounted", async () => {
        let resolveClock!: (value: { day: number; hour: number; realTimestamp: string }) => void;
        (getWorldClock as ReturnType<typeof vi.fn>).mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveClock = resolve;
                }),
        );

        const { unmount } = renderHook(() => useWorldClockLighting());
        unmount();

        resolveClock({ day: 5, hour: 10, realTimestamp: REAL_NOW.toISOString() });
        await flushMicrotasks();

        expect(applySunLighting).not.toHaveBeenCalled();
    });

    it("stops syncing and extrapolating after unmount", async () => {
        (getWorldClock as ReturnType<typeof vi.fn>).mockResolvedValue({
            day: 5,
            hour: 10,
            realTimestamp: REAL_NOW.toISOString(),
        });

        const { unmount } = renderHook(() => useWorldClockLighting());
        await flushMicrotasks();

        unmount();
        (getWorldClock as ReturnType<typeof vi.fn>).mockClear();
        (applySunLighting as ReturnType<typeof vi.fn>).mockClear();

        act(() => {
            vi.advanceTimersByTime(SYNC_INTERVAL_MS + EXTRAPOLATE_INTERVAL_MS);
        });
        await flushMicrotasks();

        expect(getWorldClock).not.toHaveBeenCalled();
        expect(applySunLighting).not.toHaveBeenCalled();
    });
});
