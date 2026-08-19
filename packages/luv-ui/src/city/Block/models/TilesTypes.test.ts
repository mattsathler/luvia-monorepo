import { describe, expect, it } from "vitest";
import { TILE_TYPES } from "./TilesTypes";

describe("TILE_TYPES", () => {
    it("has a color and a texture for every declared tile type", () => {
        const keys = ["grass", "road", "road-r", "road-l", "road-i", "sand", "ocean", "autumn", "snow"] as const;

        expect(Object.keys(TILE_TYPES).sort()).toEqual([...keys].sort());

        for (const key of keys) {
            expect(TILE_TYPES[key].color).toBe("#ffffff00");
            expect(typeof TILE_TYPES[key].texture).toBe("string");
            expect(TILE_TYPES[key].texture.length).toBeGreaterThan(0);
        }
    });

    it("aliases the plain 'road' tile to the road-r texture", () => {
        expect(TILE_TYPES.road.texture).toBe(TILE_TYPES["road-r"].texture);
    });
});
