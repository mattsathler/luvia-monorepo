import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavigationPanel } from "./NavigationPanel";
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

const CURRENT_LOT = { name: "Residência", x: 0, y: 0 };

describe("NavigationPanel", () => {
    it("shows all five navigation icons", () => {
        render(<NavigationPanel character={CHARACTER} currentLot={CURRENT_LOT} />);

        expect(screen.getByText("work")).toBeInTheDocument();
        expect(screen.getByText("favorite")).toBeInTheDocument();
        expect(screen.getByText("store")).toBeInTheDocument();
        expect(screen.getByText("person")).toBeInTheDocument();
        expect(screen.getByText("settings")).toBeInTheDocument();
    });

    it("logs the selected option when clicked (no screen behind it yet)", async () => {
        const user = userEvent.setup();
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        render(<NavigationPanel character={CHARACTER} currentLot={CURRENT_LOT} />);
        await user.click(screen.getByText("work"));

        expect(logSpy).toHaveBeenCalledWith("Navegar para:", "career");

        logSpy.mockRestore();
    });
});
