import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterProvider, useCharacter } from "./CharacterContext";
import { useAuth } from "../auth/AuthContext";
import type { Character } from "../lib/api";

vi.mock("../auth/AuthContext", () => ({
    useAuth: vi.fn(),
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
        hairType: "0",
        eyeType: "0",
        face: "0",
        accessory: null,
        top: "default",
        pants: "default",
        shoes: "default",
        overlay: "default",
    },
};

function TestConsumer() {
    const { character, selectCharacter, clearCharacter } = useCharacter();

    return (
        <div>
            <span data-testid="character">{character?.firstName ?? ""}</span>
            <button onClick={() => selectCharacter(CHARACTER)}>select</button>
            <button onClick={clearCharacter}>clear</button>
        </div>
    );
}

describe("CharacterProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: true });
    });

    it("starts with no character selected", () => {
        render(
            <CharacterProvider>
                <TestConsumer />
            </CharacterProvider>,
        );

        expect(screen.getByTestId("character").textContent).toBe("");
    });

    it("selectCharacter() sets the current character", async () => {
        const user = userEvent.setup();
        render(
            <CharacterProvider>
                <TestConsumer />
            </CharacterProvider>,
        );

        await user.click(screen.getByText("select"));

        expect(screen.getByTestId("character").textContent).toBe("Ana");
    });

    it("clearCharacter() forgets the current character", async () => {
        const user = userEvent.setup();
        render(
            <CharacterProvider>
                <TestConsumer />
            </CharacterProvider>,
        );

        await user.click(screen.getByText("select"));
        await user.click(screen.getByText("clear"));

        expect(screen.getByTestId("character").textContent).toBe("");
    });

    it("forgets the character when the session becomes unauthenticated", async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CharacterProvider>
                <TestConsumer />
            </CharacterProvider>,
        );

        await user.click(screen.getByText("select"));
        expect(screen.getByTestId("character").textContent).toBe("Ana");

        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ isAuthenticated: false });
        rerender(
            <CharacterProvider>
                <TestConsumer />
            </CharacterProvider>,
        );

        expect(screen.getByTestId("character").textContent).toBe("");
    });

    it("useCharacter throws when used outside of a CharacterProvider", () => {
        function Broken() {
            useCharacter();
            return null;
        }

        expect(() => render(<Broken />)).toThrow("useCharacter must be used within a CharacterProvider");
    });
});
