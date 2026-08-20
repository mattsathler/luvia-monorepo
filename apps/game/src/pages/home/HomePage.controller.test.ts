import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DEFAULT_TILE_SIZE,
    MAX_TILE_SIZE,
    MIN_TILE_SIZE,
    ZOOM_STEP,
    isTileClickable,
    useHomePageController,
} from "./HomePage.controller";
import { useAuth } from "../../auth/AuthContext";
import { getStoredTileSize } from "./city-zoom-storage";
import { getCity, getCurrentLot, type Character } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return {
        ...actual,
        getCurrentLot: vi.fn(),
        getCity: vi.fn(),
    };
});

const CHARACTER = { id: "char-1" } as Character;

describe("isTileClickable", () => {
    it.each(["road-r", "road-l", "road-i"] as const)("is false for road tiles (%s)", (type) => {
        expect(isTileClickable({ x: 0, y: 0, z: 0, type })).toBe(false);
    });

    it.each(["grass", "ocean", "landmark", "lot", "lot-mine"] as const)("is true for non-road tiles (%s)", (type) => {
        expect(isTileClickable({ x: 0, y: 0, z: 0, type })).toBe(true);
    });
});

describe("useHomePageController handleTileClick", () => {
    it("logs the clicked tile (no info panel built yet)", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));
        result.current.handleTileClick({ x: 1, y: 2, z: 0, type: "grass" });

        expect(logSpy).toHaveBeenCalledWith("Tile clicado:", { x: 1, y: 2, z: 0, type: "grass" });

        logSpy.mockRestore();
    });
});

describe("useHomePageController currentLot", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
        (getCity as ReturnType<typeof vi.fn>).mockResolvedValue({ width: 10, height: 10, backgroundColor: "#fff" });
    });

    it("exposes the lot the backend resolves as current", async () => {
        (getCurrentLot as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "Residência", x: 3, y: 5 });

        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        await vi.waitFor(() => expect(result.current.currentLot).not.toBeNull());

        expect(getCurrentLot).toHaveBeenCalledWith("token-123", "char-1");
        expect(result.current.currentLot).toEqual({ name: "Residência", x: 3, y: 5 });
    });
});

describe("useHomePageController zoom", () => {
    beforeEach(() => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("starts at DEFAULT_TILE_SIZE when nothing was stored", () => {
        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        expect(result.current.tileSize).toBe(DEFAULT_TILE_SIZE);
        expect(result.current.canZoomIn).toBe(true);
        expect(result.current.canZoomOut).toBe(true);
    });

    it("starts from the persisted tile size when one was stored", () => {
        localStorage.setItem("luvia.cityTileSize", String(MIN_TILE_SIZE + ZOOM_STEP));

        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        expect(result.current.tileSize).toBe(MIN_TILE_SIZE + ZOOM_STEP);
    });

    it("zoomIn increases the tile size by ZOOM_STEP and persists it", () => {
        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        act(() => result.current.zoomIn());

        expect(result.current.tileSize).toBe(DEFAULT_TILE_SIZE + ZOOM_STEP);
        expect(getStoredTileSize()).toBe(DEFAULT_TILE_SIZE + ZOOM_STEP);
    });

    it("zoomOut decreases the tile size by ZOOM_STEP and persists it", () => {
        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        act(() => result.current.zoomOut());

        expect(result.current.tileSize).toBe(DEFAULT_TILE_SIZE - ZOOM_STEP);
        expect(getStoredTileSize()).toBe(DEFAULT_TILE_SIZE - ZOOM_STEP);
    });

    it("clamps at MAX_TILE_SIZE and disables zooming in further", () => {
        localStorage.setItem("luvia.cityTileSize", String(MAX_TILE_SIZE));
        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        expect(result.current.canZoomIn).toBe(false);

        act(() => result.current.zoomIn());

        expect(result.current.tileSize).toBe(MAX_TILE_SIZE);
    });

    it("clamps at MIN_TILE_SIZE and disables zooming out further", () => {
        localStorage.setItem("luvia.cityTileSize", String(MIN_TILE_SIZE));
        const { result } = renderHook(() => useHomePageController({ character: CHARACTER }));

        expect(result.current.canZoomOut).toBe(false);

        act(() => result.current.zoomOut());

        expect(result.current.tileSize).toBe(MIN_TILE_SIZE);
    });
});
