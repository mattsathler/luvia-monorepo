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
        { x: 1, y: 0, type: "grass" },
    ],
    lots: [{ id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 }],
};

describe("HomePage", () => {
    const logoutMock = vi.fn();
    const onChangeCharacter = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ logout: logoutMock, accessToken: "token-123" });
        (getCharacterLot as ReturnType<typeof vi.fn>).mockResolvedValue(CITY.lots[0]);
        (getCity as ReturnType<typeof vi.fn>).mockResolvedValue(CITY);
    });

    it("shows the selected character's name", () => {
        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);

        expect(screen.getByText("Você está logado como Ana Silva.")).toBeInTheDocument();
    });

    it("logs out when Sair is clicked", async () => {
        const user = userEvent.setup();

        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);
        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    it("requests a character change when the back button is clicked", async () => {
        const user = userEvent.setup();

        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);
        await user.click(screen.getByRole("button", { name: "Voltar para seleção de personagens" }));

        expect(onChangeCharacter).toHaveBeenCalledTimes(1);
    });

    it("shows a loading state before the city arrives", () => {
        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);

        expect(screen.getByText("Carregando cidade...")).toBeInTheDocument();
    });

    it("claims the character's lot before rendering the city grid", async () => {
        const { container } = render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);

        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(2));

        expect(getCharacterLot).toHaveBeenCalledWith("token-123", "char-1");
        expect(getCity).toHaveBeenCalledWith("token-123");
        expect(screen.queryByText("Carregando cidade...")).not.toBeInTheDocument();
    });

    it("does not fetch the city when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ logout: logoutMock, accessToken: null });

        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);

        expect(getCharacterLot).not.toHaveBeenCalled();
        expect(getCity).not.toHaveBeenCalled();
    });

    it("shows an error state when the city fails to load", async () => {
        (getCharacterLot as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        render(<HomePage character={CHARACTER} onChangeCharacter={onChangeCharacter} />);

        expect(await screen.findByText("Não foi possível carregar a cidade. Tente novamente.")).toBeInTheDocument();
    });
});
