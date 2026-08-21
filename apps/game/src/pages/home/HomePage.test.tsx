import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { useAuth } from "../../auth/AuthContext";
import { getCurrentLot, getCity } from "../../lib/api";
import { DEFAULT_TILE_SIZE } from "./HomePage.controller";
import type { Character, City } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return {
        ...actual,
        getCurrentLot: vi.fn(),
        getCity: vi.fn(),
    };
});

// CityGrid tem cobertura própria (chunk cache, IntersectionObserver etc. —
// ver CityGrid.test.tsx); aqui só interessa que a HomePage passa as props
// certas depois que a cidade carrega.
vi.mock("./CityGrid", () => ({
    CityGrid: (props: Record<string, unknown>) => (
        <div data-testid="city-grid" data-props={JSON.stringify(props)} />
    ),
}));

// useWorldClockLighting tem cobertura própria (ver useWorldClockLighting.test.ts)
// — aqui só interessa que a HomePage a chama, sem rodar fetch/timers de verdade.
vi.mock("./useWorldClockLighting", () => ({
    useWorldClockLighting: vi.fn(),
}));

const CHARACTER: Character = {
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

const CITY: City = { width: 40, height: 40, backgroundColor: "#7bc96f" };

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
        (getCurrentLot as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "Residência", x: 0, y: 0 });
        (getCity as ReturnType<typeof vi.fn>).mockResolvedValue(CITY);
    });

    afterEach(() => {
        localStorage.clear();
    });

    it("shows a loading state before the city's dimensions arrive", () => {
        render(<HomePage character={CHARACTER} />);

        expect(screen.getByText("Carregando cidade...")).toBeInTheDocument();
    });

    it("resolves the character's current lot, then renders CityGrid full-screen with the right props", async () => {
        render(<HomePage character={CHARACTER} />);

        const cityGrid = await screen.findByTestId("city-grid");

        expect(getCurrentLot).toHaveBeenCalledWith("token-123", "char-1");
        expect(getCity).toHaveBeenCalledWith("token-123");
        expect(screen.queryByText("Carregando cidade...")).not.toBeInTheDocument();

        const props = JSON.parse(cityGrid.getAttribute("data-props")!);
        expect(props.dimensions).toEqual(CITY);
        expect(props.tileSize).toBe(DEFAULT_TILE_SIZE);
        expect(props.accessToken).toBe("token-123");
        expect(props.characterId).toBe("char-1");
    });

    it("does not fetch the city when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        render(<HomePage character={CHARACTER} />);

        expect(getCurrentLot).not.toHaveBeenCalled();
        expect(getCity).not.toHaveBeenCalled();
    });

    it("shows an error state when the city fails to load", async () => {
        (getCurrentLot as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        render(<HomePage character={CHARACTER} />);

        expect(await screen.findByText("Não foi possível carregar a cidade. Tente novamente.")).toBeInTheDocument();
    });
});
