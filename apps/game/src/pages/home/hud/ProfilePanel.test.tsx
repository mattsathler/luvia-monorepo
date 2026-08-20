import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfilePanel } from "./ProfilePanel";
import type { Character } from "../../../lib/api";

const CHARACTER: Character = {
    id: "char-1",
    accountId: "acc-1",
    firstName: "Ana",
    lastName: "Silva",
    gender: "female",
    skills: {},
    happiness: 80,
    energy: 40,
    money: 2350,
    fame: 1250,
    activity: "idle",
    activityEndsAt: null,
    lastUpdatedAt: "2026-01-01T00:00:00.000Z",
    appearance: {
        skinTone: 3,
        hairType: "liso-1",
        eyeType: "redondo-1",
        face: "default",
        accessory: null,
        top: "default",
        pants: "default",
        shoes: "default",
        overlay: "default",
    },
};

describe("ProfilePanel", () => {
    it("shows the character's name and fame", () => {
        render(<ProfilePanel character={CHARACTER} />);

        expect(screen.getByText("Ana Silva")).toBeInTheDocument();
        expect(screen.getByText("1250")).toBeInTheDocument();
    });

    it("shows happiness and energy as bars out of 100", () => {
        render(<ProfilePanel character={CHARACTER} />);

        expect(screen.getByText("80/100")).toBeInTheDocument();
        expect(screen.getByText("40/100")).toBeInTheDocument();
    });

    it("shows the character's money", () => {
        render(<ProfilePanel character={CHARACTER} />);

        expect(screen.getByText("2350")).toBeInTheDocument();
    });
});
