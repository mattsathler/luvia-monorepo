import { describe, expect, it } from "vitest";
import { TILE_TYPES } from "./TilesTypes";

describe("TILE_TYPES", () => {
    const terrainKeys = [
        "grass",
        "road",
        "road-r",
        "road-l",
        "road-i",
        "road-corner-dr",
        "road-corner-dl",
        "road-corner-lu",
        "road-corner-ru",
        "sand",
        "ocean",
        "autumn",
        "snow",
    ] as const;
    const lotKeys = ["lot", "lot-mine"] as const;
    const poiKeys = ["landmark"] as const;

    it("has a color and a texture for every declared tile type", () => {
        expect(Object.keys(TILE_TYPES).sort()).toEqual([...terrainKeys, ...lotKeys, ...poiKeys].sort());

        for (const key of [...terrainKeys, ...lotKeys, ...poiKeys]) {
            expect(typeof TILE_TYPES[key].color).toBe("string");
            expect(typeof TILE_TYPES[key].texture).toBe("string");
            expect(TILE_TYPES[key].texture.length).toBeGreaterThan(0);
        }
    });

    it("leaves plain terrain tiles untinted", () => {
        for (const key of terrainKeys) {
            expect(TILE_TYPES[key].color).toBe("#ffffff00");
        }
    });

    it("aliases the plain 'road' tile to the road-r texture", () => {
        expect(TILE_TYPES.road.texture).toBe(TILE_TYPES["road-r"].texture);
    });

    it("tints lot tiles to stand out from plain terrain, reusing the grass texture", () => {
        expect(TILE_TYPES.lot.color).not.toBe("#ffffff00");
        expect(TILE_TYPES["lot-mine"].color).not.toBe("#ffffff00");
        expect(TILE_TYPES.lot.color).not.toBe(TILE_TYPES["lot-mine"].color);
        expect(TILE_TYPES.lot.texture).toBe(TILE_TYPES.grass.texture);
        expect(TILE_TYPES["lot-mine"].texture).toBe(TILE_TYPES.grass.texture);
    });

    it("tints landmark tiles with their own color, reusing the grass texture", () => {
        expect(TILE_TYPES.landmark.color).not.toBe("#ffffff00");
        expect(TILE_TYPES.landmark.color).not.toBe(TILE_TYPES.lot.color);
        expect(TILE_TYPES.landmark.color).not.toBe(TILE_TYPES["lot-mine"].color);
        expect(TILE_TYPES.landmark.texture).toBe(TILE_TYPES.grass.texture);
    });
});
