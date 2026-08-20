import { describe, expect, it } from "vitest";
import { buildCityTiles, isTileClickable } from "./HomePage.controller";
import type { City } from "../../lib/api";

describe("buildCityTiles", () => {
    it("passes real terrain tiles through untouched when there is no lot at that position", () => {
        const city: City = {
            width: 2,
            height: 1,
            tiles: [
                { x: 0, y: 0, type: "road-r" },
                { x: 1, y: 0, type: "ocean" },
            ],
            lots: [],
        };

        expect(buildCityTiles(city, "char-1")).toEqual([
            { x: 0, y: 0, z: 0, type: "road-r" },
            { x: 1, y: 0, z: 0, type: "ocean" },
        ]);
    });

    it("overrides the terrain tile with lot-mine/lot for the character's and other players' lots", () => {
        const city: City = {
            width: 2,
            height: 1,
            tiles: [
                { x: 0, y: 0, type: "grass" },
                { x: 1, y: 0, type: "grass" },
            ],
            lots: [
                { id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 },
                { id: "lot-2", characterId: "char-2", type: "residential", x: 1, y: 0 },
            ],
        };

        expect(buildCityTiles(city, "char-1")).toEqual([
            { x: 0, y: 0, z: 0, type: "lot-mine" },
            { x: 1, y: 0, z: 0, type: "lot" },
        ]);
    });
});

describe("isTileClickable", () => {
    it.each(["road-r", "road-l", "road-i"] as const)("is false for road tiles (%s)", (type) => {
        expect(isTileClickable({ x: 0, y: 0, z: 0, type })).toBe(false);
    });

    it.each(["grass", "ocean", "landmark", "lot", "lot-mine"] as const)("is true for non-road tiles (%s)", (type) => {
        expect(isTileClickable({ x: 0, y: 0, z: 0, type })).toBe(true);
    });
});
