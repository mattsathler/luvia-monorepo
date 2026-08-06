import { describe, expect, it } from "vitest";
import { characterToPlayerLayers } from "./characterToPlayerLayers";
import type { Character } from "../../lib/api";

function characterWithSkinTone(skinTone: Character["appearance"]["skinTone"]): Character {
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
        appearance: {
            skinTone,
            hairType: "0",
            eyeType: "0",
            face: "default",
            accessory: null,
            top: "default",
            pants: "default",
            shoes: "default",
        },
    };
}

describe("characterToPlayerLayers", () => {
    it("maps the character's skin tone to the body_types layer id", () => {
        expect(characterToPlayerLayers(characterWithSkinTone(4)).body_types).toBe("4");
    });

    it("defaults faces and clothes to the only option available today", () => {
        const layers = characterToPlayerLayers(characterWithSkinTone(0));

        expect(layers.faces).toBe("0");
        expect(layers.clothes).toBe("0");
    });
});
