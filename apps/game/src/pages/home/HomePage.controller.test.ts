import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { isTileClickable, useHomePageController } from "./HomePage.controller";
import { useAuth } from "../../auth/AuthContext";
import type { Character } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

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
        const character = { id: "char-1" } as Character;

        const { result } = renderHook(() => useHomePageController({ character }));
        result.current.handleTileClick({ x: 1, y: 2, z: 0, type: "grass" });

        expect(logSpy).toHaveBeenCalledWith("Tile clicado:", { x: 1, y: 2, z: 0, type: "grass" });

        logSpy.mockRestore();
    });
});
