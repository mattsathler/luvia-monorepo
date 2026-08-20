import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { useAuth } from "../../auth/AuthContext";
import { getCharacterLot, getCity } from "../../lib/api";
import type { Character, City } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return {
        ...actual,
        getCharacterLot: vi.fn(),
        getCity: vi.fn(),
    };
});

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

const CITY: City = {
    width: 2,
    height: 1,
    tiles: [
        { x: 0, y: 0, type: "grass" },
        { x: 1, y: 0, type: "road-r" },
    ],
    lots: [{ id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 }],
};

describe("HomePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
        (getCharacterLot as ReturnType<typeof vi.fn>).mockResolvedValue(CITY.lots[0]);
        (getCity as ReturnType<typeof vi.fn>).mockResolvedValue(CITY);
    });

    it("shows a loading state before the city arrives", () => {
        render(<HomePage character={CHARACTER} />);

        expect(screen.getByText("Carregando cidade...")).toBeInTheDocument();
    });

    it("claims the character's lot before rendering the city grid, filling the whole screen", async () => {
        const { container } = render(<HomePage character={CHARACTER} />);

        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(2));

        expect(getCharacterLot).toHaveBeenCalledWith("token-123", "char-1");
        expect(getCity).toHaveBeenCalledWith("token-123");
        expect(screen.queryByText("Carregando cidade...")).not.toBeInTheDocument();
        expect(container.querySelector(".h-screen")).toBeInTheDocument();
    });

    it("does not fetch the city when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        render(<HomePage character={CHARACTER} />);

        expect(getCharacterLot).not.toHaveBeenCalled();
        expect(getCity).not.toHaveBeenCalled();
    });

    it("shows an error state when the city fails to load", async () => {
        (getCharacterLot as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        render(<HomePage character={CHARACTER} />);

        expect(await screen.findByText("Não foi possível carregar a cidade. Tente novamente.")).toBeInTheDocument();
    });

    it("makes non-road tiles clickable and reports the clicked tile", async () => {
        const user = userEvent.setup();
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        render(<HomePage character={CHARACTER} />);

        // Só o tile de grama (0,0) é clicável — a rua (1,0) fica de fora.
        const tiles = await screen.findAllByRole("button");
        expect(tiles).toHaveLength(1);

        await user.click(tiles[0]);

        expect(logSpy).toHaveBeenCalledWith("Tile clicado:", expect.objectContaining({ x: 0, y: 0 }));

        logSpy.mockRestore();
    });
});
