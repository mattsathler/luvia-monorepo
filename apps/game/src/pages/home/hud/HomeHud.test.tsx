import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { HomeHud } from "./HomeHud";
import { useAuth } from "../../../auth/AuthContext";
import type { Character } from "../../../lib/api";

vi.mock("../../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../../lib/api")>("../../../lib/api");
    return { ...actual, searchLots: vi.fn(() => new Promise(() => {})) };
});

(useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });

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

describe("HomeHud", () => {
    it("renders the profile, world clock, and calendar panels", () => {
        render(
            <MemoryRouter>
                <HomeHud
                    character={CHARACTER}
                    currentLot={CURRENT_LOT}
                    hour={14.5}
                    weekday={2}
                    weather={{ type: "rainy", temperature: 17 }}
                    dragModeEnabled={false}
                    onSetDragMode={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText("Ana Silva")).toBeInTheDocument();
        expect(screen.getByText("14:30")).toBeInTheDocument();
        expect(screen.getByText("Quarta-feira")).toBeInTheDocument();
        expect(screen.getByText("17°C")).toBeInTheDocument();
        expect(screen.getByText("Chuvoso")).toBeInTheDocument();
        expect(screen.getByText("Descansando")).toBeInTheDocument();
    });

    it("shows the world clock placeholder while the hour/weekday/weather haven't synced yet", () => {
        render(
            <MemoryRouter>
                <HomeHud
                    character={CHARACTER}
                    currentLot={CURRENT_LOT}
                    hour={null}
                    weekday={null}
                    weather={null}
                    dragModeEnabled={false}
                    onSetDragMode={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByText("--:--")).toBeInTheDocument();
        expect(screen.getByText("--°C")).toBeInTheDocument();
    });

    it("shows navigate and inspect as mutually exclusive — only the active mode is pressed", () => {
        render(
            <MemoryRouter>
                <HomeHud
                    character={CHARACTER}
                    currentLot={CURRENT_LOT}
                    hour={14.5}
                    weekday={2}
                    weather={{ type: "rainy", temperature: 17 }}
                    dragModeEnabled={false}
                    onSetDragMode={vi.fn()}
                />
            </MemoryRouter>,
        );

        expect(screen.getByRole("button", { name: "Navegar pelo mapa" })).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByRole("button", { name: "Inspecionar um lote" })).toHaveAttribute("aria-pressed", "true");
    });

    it("calls onSetDragMode with the clicked button's mode", async () => {
        const user = userEvent.setup();
        const onSetDragMode = vi.fn();

        render(
            <MemoryRouter>
                <HomeHud
                    character={CHARACTER}
                    currentLot={CURRENT_LOT}
                    hour={14.5}
                    weekday={2}
                    weather={{ type: "rainy", temperature: 17 }}
                    dragModeEnabled={false}
                    onSetDragMode={onSetDragMode}
                />
            </MemoryRouter>,
        );

        await user.click(screen.getByRole("button", { name: "Navegar pelo mapa" }));
        expect(onSetDragMode).toHaveBeenCalledWith(true);

        await user.click(screen.getByRole("button", { name: "Inspecionar um lote" }));
        expect(onSetDragMode).toHaveBeenCalledWith(false);
    });
});
