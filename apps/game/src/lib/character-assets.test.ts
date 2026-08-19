import { describe, expect, it } from "vitest";
import { buildCatalog, getLayerAssets, getLayerSrc } from "./character-assets";

describe("character-assets", () => {
    it("lists body_types ids 0 through 5, sorted numerically", () => {
        const assets = getLayerAssets("body_types");

        expect(assets.map((asset) => asset.id)).toEqual(["0", "1", "2", "3", "4", "5"]);
        expect(assets.every((asset) => typeof asset.src === "string" && asset.src.length > 0)).toBe(true);
    });

    it("lists two options for faces, tops, pants and overlays", () => {
        expect(getLayerAssets("faces").map((asset) => asset.id)).toEqual(["0", "1"]);
        expect(getLayerAssets("tops").map((asset) => asset.id)).toEqual(["0", "1"]);
        expect(getLayerAssets("pants").map((asset) => asset.id)).toEqual(["0", "1"]);
        expect(getLayerAssets("overlays").map((asset) => asset.id)).toEqual(["0", "1"]);
    });

    it("lists a single option for hair_types and shoes", () => {
        expect(getLayerAssets("hair_types").map((asset) => asset.id)).toEqual(["0"]);
        expect(getLayerAssets("shoes").map((asset) => asset.id)).toEqual(["0"]);
    });

    it("returns an empty list for a category with no assets yet", () => {
        expect(getLayerAssets("accessory")).toEqual([]);
    });

    it("resolves the src of a known id within a category", () => {
        const [firstBodyType] = getLayerAssets("body_types");

        expect(getLayerSrc("body_types", "0")).toBe(firstBodyType.src);
    });

    it("returns undefined for an unknown id or category", () => {
        expect(getLayerSrc("body_types", "99")).toBeUndefined();
        expect(getLayerSrc("accessory", "0")).toBeUndefined();
    });

    it("gives every asset a previewSrc distinct from its src (every asset today has a dedicated preview)", () => {
        for (const category of ["body_types", "faces", "tops", "pants", "hair_types", "shoes", "overlays"]) {
            for (const asset of getLayerAssets(category)) {
                expect(typeof asset.previewSrc).toBe("string");
                expect(asset.previewSrc.length).toBeGreaterThan(0);
                expect(asset.previewSrc).not.toBe(asset.src);
            }
        }
    });

    it("uses a dedicated (different) preview for the 'remove this piece' slot of optional layers", () => {
        const [noHair] = getLayerAssets("hair_types");
        const [noShoes] = getLayerAssets("shoes");
        const [noOverlay] = getLayerAssets("overlays");

        expect(noHair.previewSrc).not.toBe(noHair.src);
        expect(noShoes.previewSrc).not.toBe(noShoes.src);
        expect(noOverlay.previewSrc).not.toBe(noOverlay.src);
    });
});

describe("buildCatalog", () => {
    it("throws when a file's id doesn't match its folder's id", () => {
        const modules = {
            "../assets/character/tops/0/1_model.png": { default: "tops-1.png" },
        };

        expect(() => buildCatalog(modules)).toThrow(
            'Character asset id mismatch: ../assets/character/tops/0/1_model.png (pasta "0" vs arquivo "1")',
        );
    });

    it("throws when an id has a preview but no model", () => {
        const modules = {
            "../assets/character/tops/0/0_preview.png": { default: "tops-0-preview.png" },
        };

        expect(() => buildCatalog(modules)).toThrow("Character asset sem <id>_model.png: tops/0");
    });

    it("falls back to the model src when there's no dedicated preview", () => {
        const modules = {
            "../assets/character/tops/0/0_model.png": { default: "tops-0-model.png" },
        };

        const catalog = buildCatalog(modules);

        expect(catalog.tops).toEqual([{ id: "0", src: "tops-0-model.png", previewSrc: "tops-0-model.png" }]);
    });
});
