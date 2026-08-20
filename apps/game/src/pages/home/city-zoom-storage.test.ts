import { afterEach, describe, expect, it } from "vitest";
import { getStoredTileSize, setStoredTileSize } from "./city-zoom-storage";

describe("city-zoom-storage", () => {
    afterEach(() => {
        localStorage.clear();
    });

    it("returns null when no tile size is stored", () => {
        expect(getStoredTileSize()).toBeNull();
    });

    it("stores and retrieves the tile size", () => {
        setStoredTileSize(128);

        expect(getStoredTileSize()).toBe(128);
    });

    it("returns null when the stored value is not a valid number", () => {
        localStorage.setItem("luvia.cityTileSize", "not-a-number");

        expect(getStoredTileSize()).toBeNull();
    });
});
