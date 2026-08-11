import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { useAuth } from "../../auth/AuthContext";
import type { Character } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

const CHARACTER: Character = {
    id: "char-1",
    accountId: "acc-1",
    firstName: "Ana",
    lastName: "Silva",
    gender: "female",
    skills: { intelligence: 2, charisma: 2 },
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
    },
};

describe("HomePage", () => {
    const logoutMock = vi.fn();
    const onChangeCharacter = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ logout: logoutMock });
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
});
