import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMapSearchPanelController } from "./MapSearchPanel.controller";
import { useAuth } from "../../../auth/AuthContext";
import { searchLots, type Character } from "../../../lib/api";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => navigateMock,
}));

vi.mock("../../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../../lib/api")>("../../../lib/api");
    return { ...actual, searchLots: vi.fn() };
});

const DEBOUNCE_MS = 250;

const CHARACTER = { id: "char-1" } as Character;

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

        const { result } = renderHook(() => useMapSearchPanelController(CHARACTER));

        expect(result.current.query).toBe("");
        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(true);
    });

    it("searches with an empty query and the character id on mount (no filter), after the debounce", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: 5 },
        ]);

        const { result } = renderHook(() => useMapSearchPanelController(CHARACTER));

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });
        await flushMicrotasks();

        expect(searchLots).toHaveBeenCalledWith("token-123", "", "char-1");
        expect(result.current.results).toEqual([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: 5 },
        ]);
        expect(result.current.isLoading).toBe(false);
    });

    it("does not search when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        renderHook(() => useMapSearchPanelController(CHARACTER));

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });

        expect(searchLots).not.toHaveBeenCalled();
    });

    it("debounces: only the last query typed within the window reaches the backend", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        const { result, rerender } = renderHook(() => useMapSearchPanelController(CHARACTER));

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
        expect(searchLots).toHaveBeenLastCalledWith("token-123", "ana", "char-1");
    });

    it("clears results (falls back to an empty list) when the search fails", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        const { result } = renderHook(() => useMapSearchPanelController(CHARACTER));

        act(() => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
        });
        await flushMicrotasks();

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it("handleSelectLot navigates to /play with the lot id and coordinates in the URL, replacing history", () => {
        (searchLots as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useMapSearchPanelController(CHARACTER));
        const lot = { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: 5 };
        result.current.handleSelectLot(lot);

        expect(navigateMock).toHaveBeenCalledWith("/play?lot=lot-1&x=3&y=5", { replace: true });
    });
});
