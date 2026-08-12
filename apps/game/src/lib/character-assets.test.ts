import { describe, expect, it } from "vitest";
import { getLayerAssets, getLayerSrc } from "./character-assets";

describe("character-assets", () => {
    it("lists body_types ids 0 through 5, sorted numerically", () => {
        const assets = getLayerAssets("body_types");

        expect(assets.map((asset) => asset.id)).toEqual(["0", "1", "2", "3", "4", "5"]);
        expect(assets.every((asset) => typeof asset.src === "string" && asset.src.length > 0)).toBe(true);
    });

    it("lists a single option for faces, pants, shoes and tops", () => {
        expect(getLayerAssets("faces").map((asset) => asset.id)).toEqual(["0"]);
        expect(getLayerAssets("pants").map((asset) => asset.id)).toEqual(["0"]);
        expect(getLayerAssets("shoes").map((asset) => asset.id)).toEqual(["0"]);
        expect(getLayerAssets("tops").map((asset) => asset.id)).toEqual(["0"]);
    });

    it("returns an empty list for a category with no assets yet", () => {
        expect(getLayerAssets("hair_types")).toEqual([]);
    });

    it("resolves the src of a known id within a category", () => {
        const [firstBodyType] = getLayerAssets("body_types");

        expect(getLayerSrc("body_types", "0")).toBe(firstBodyType.src);
    });

    it("returns undefined for an unknown id or category", () => {
        expect(getLayerSrc("body_types", "99")).toBeUndefined();
        expect(getLayerSrc("hair_types", "0")).toBeUndefined();
    });
});
