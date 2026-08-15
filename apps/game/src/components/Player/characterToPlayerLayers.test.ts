import { describe, expect, it } from "vitest";
import { characterToPlayerLayers } from "./characterToPlayerLayers";
import type { Character } from "../../lib/api";

function characterWithAppearance(appearance: Character["appearance"]): Character {
    return {
        id: "char-1",
        accountId: "acc-1",
        firstName: "Ana",
        lastName: "Silva",
        gender: "female",
        skills: {},
        happiness: 100,
        energy: 100,
        money: 0,
        fame: 0,
        activity: "idle",
        activityEndsAt: null,
        lastUpdatedAt: "2026-01-01T00:00:00.000Z",
        appearance,
    };
}

describe("characterToPlayerLayers", () => {
    it("maps the character's skin tone to the body_types layer id", () => {
        const layers = characterToPlayerLayers(
            characterWithAppearance({
                skinTone: 4,
                hairType: "0",
                eyeType: "0",
                face: "0",
                accessory: null,
                top: "0",
                pants: "0",
                shoes: "0",
                overlay: "0",
            }),
        );

        expect(layers.body_types).toBe("4");
    });

    it("falls back to the default id when the appearance still has the pre-wardrobe placeholder", () => {
        const layers = characterToPlayerLayers(
            characterWithAppearance({
                skinTone: 3,
                hairType: "0",
                eyeType: "0",
                face: "default",
                accessory: null,
                top: "default",
                pants: "default",
                shoes: "default",
                overlay: "default",
            }),
        );

        expect(layers.faces).toBe("0");
        expect(layers.tops).toBe("0");
        expect(layers.pants).toBe("0");
        expect(layers.shoes).toBe("0");
        expect(layers.overlays).toBe("0");
    });

    it("maps face, hair, tops, pants, shoes and overlay to the ids chosen for the character", () => {
        const layers = characterToPlayerLayers(
            characterWithAppearance({
                skinTone: 0,
                hairType: "5",
                eyeType: "0",
                face: "1",
                accessory: null,
                top: "2",
                pants: "3",
                shoes: "4",
                overlay: "6",
            }),
        );

        expect(layers.faces).toBe("1");
        expect(layers.hair_types).toBe("5");
        expect(layers.tops).toBe("2");
        expect(layers.pants).toBe("3");
        expect(layers.shoes).toBe("4");
        expect(layers.overlays).toBe("6");
    });
});
