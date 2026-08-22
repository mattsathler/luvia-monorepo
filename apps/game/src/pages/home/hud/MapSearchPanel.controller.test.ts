import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMapSearchPanelController } from "./MapSearchPanel.controller";
import { useAuth } from "../../../auth/AuthContext";
import { searchLots } from "../../../lib/api";

vi.mock("../../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../../lib/api")>("../../../lib/api");
    return { ...actual, searchLots: vi.fn() };
});

const DEBOUNCE_MS = 250;

async function flushMicrotasks() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe("useMapSearchPanelController", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("starts with an empty query and no results", () => {
        (searchLots as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useMapSearchPanelController());

        expect(result.current.query).toBe("");
        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(true);
    });

    it("searches with an empty query on mount (no filter), after the debounce", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5 },
        ]);

        const { result } = renderHook(() => useMapSearchPanelController());

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });
        await flushMicrotasks();

        expect(searchLots).toHaveBeenCalledWith("token-123", "");
        expect(result.current.results).toEqual([{ lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5 }]);
        expect(result.current.isLoading).toBe(false);
    });

    it("does not search when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        renderHook(() => useMapSearchPanelController());

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });

        expect(searchLots).not.toHaveBeenCalled();
    });

    it("debounces: only the last query typed within the window reaches the backend", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const { result, rerender } = renderHook(() => useMapSearchPanelController());

        act(() => {
            result.current.setQuery("a");
        });
        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS - 50);
        });
        act(() => {
            result.current.setQuery("ana");
        });
        rerender();

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });
        await flushMicrotasks();

        expect(searchLots).toHaveBeenCalledTimes(1);
        expect(searchLots).toHaveBeenLastCalledWith("token-123", "ana");
    });

    it("clears results (falls back to an empty list) when the search fails", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        const { result } = renderHook(() => useMapSearchPanelController());

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });
        await flushMicrotasks();

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it("handleSelectLot logs the selected lot (navigation not wired yet)", () => {
        (searchLots as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        const { result } = renderHook(() => useMapSearchPanelController());
        const lot = { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5 };
        result.current.handleSelectLot(lot);

        expect(logSpy).toHaveBeenCalledWith("Navegar até o lote:", lot);

        logSpy.mockRestore();
    });
});
