import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CalendarPanel } from "./CalendarPanel";
import type { Character } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";

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

const CURRENT_LOT: CurrentLot = { name: "Residência", x: 3, y: 5 };

describe("CalendarPanel", () => {
    it("shows a translated label for the current activity", () => {
        render(<CalendarPanel character={{ ...CHARACTER, activity: "working" }} currentLot={CURRENT_LOT} />);

        expect(screen.getByText("Trabalhando")).toBeInTheDocument();
    });

    it("falls back to the raw activity id when there is no known label", () => {
        render(<CalendarPanel character={{ ...CHARACTER, activity: "studying" }} currentLot={CURRENT_LOT} />);

        expect(screen.getByText("studying")).toBeInTheDocument();
    });

    it("hides the cancel button while idle", () => {
        render(<CalendarPanel character={{ ...CHARACTER, activity: "idle" }} currentLot={CURRENT_LOT} />);

        expect(screen.getByText("Nenhuma")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Cancelar atividade" })).not.toBeInTheDocument();
    });

    it("shows a cancel button while doing an activity", async () => {
        const user = userEvent.setup();
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        render(<CalendarPanel character={{ ...CHARACTER, activity: "resting" }} currentLot={CURRENT_LOT} />);

        const cancelButton = screen.getByRole("button", { name: "Cancelar atividade" });
        await user.click(cancelButton);

        expect(logSpy).toHaveBeenCalledWith("Cancelar atividade:", "resting");
        logSpy.mockRestore();
    });

    it("shows the current lot's name", () => {
        render(<CalendarPanel character={CHARACTER} currentLot={CURRENT_LOT} />);

        expect(screen.getByText("Residência")).toBeInTheDocument();
    });
});
