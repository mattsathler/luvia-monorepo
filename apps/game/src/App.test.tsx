import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import * as api from "./lib/api";
import { clearStoredToken, setStoredToken } from "./auth/token-storage";

const CHARACTER: api.Character = {
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

vi.mock("./lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof api>();
    return {
        ...actual,
        login: vi.fn(),
        authFetch: vi.fn(),
        listMyCharacters: vi.fn(),
        createCharacter: vi.fn(),
        updateAppearance: vi.fn(),
        getCharacterLot: vi.fn(),
        getCity: vi.fn(),
    };
});

vi.mock("./lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: () => null,
}));

describe("App", () => {
    beforeEach(() => {
        clearStoredToken();
        vi.clearAllMocks();
        window.history.pushState(null, "", "/");
        (api.getCharacterLot as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: "lot-1",
            characterId: CHARACTER.id,
            type: "residential",
            x: 0,
            y: 0,
        });
        (api.getCity as ReturnType<typeof vi.fn>).mockResolvedValue({
            width: 1,
            height: 1,
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [{ id: "lot-1", characterId: CHARACTER.id, type: "residential", x: 0, y: 0 }],
        });
    });

    it("shows the login page when there is no session", async () => {
        render(<App />);

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("navigates to the register page and back", async () => {
        const user = userEvent.setup();

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Cadastre-se" }));

        expect(await screen.findByRole("heading", { name: "Criar conta" })).toBeInTheDocument();

        await user.click(screen.getByText("Já tem conta? Entrar"));

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("redirects away from /login to the character list when already authenticated", async () => {
        window.history.pushState(null, "", "/login");
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);

        render(<App />);

        expect(await screen.findByRole("heading", { name: "Selecione seu personagem" })).toBeInTheDocument();
    });

    it("redirects to login when visiting a protected route without a session", async () => {
        window.history.pushState(null, "", "/play");

        render(<App />);

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("redirects to character selection when visiting /play without a character selected", async () => {
        window.history.pushState(null, "", "/play");
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        render(<App />);

        expect(await screen.findByRole("heading", { name: "Selecione seu personagem" })).toBeInTheDocument();
    });

    it("shows the character select page when there is a valid session", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);

        render(<App />);

        expect(await screen.findByRole("heading", { name: "Selecione seu personagem" })).toBeInTheDocument();
    });

    it("shows the authenticated content after selecting a character", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        const { container } = render(<App />);
        await user.click(await screen.findByRole("button", { name: "Ana Silva" }));

        // A home virou a cidade em tela cheia (ver docs/decisions/0025) — sem
        // header/HUD por enquanto, então a evidência de "chegou na home" é o
        // mapa renderizado, não mais um texto de boas-vindas.
        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));
    });

    it("navigates to the dedicated character creation page and back", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Criar novo personagem" }));

        expect(await screen.findByRole("heading", { name: "Crie seu personagem" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Voltar para seleção de personagens" }));

        expect(await screen.findByRole("heading", { name: "Selecione seu personagem" })).toBeInTheDocument();
    });

    it("shows the newly created character's home page after creation", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        (api.createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        (api.updateAppearance as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        const user = userEvent.setup();

        const { container } = render(<App />);
        await user.click(await screen.findByRole("button", { name: "Criar novo personagem" }));
        await screen.findByRole("heading", { name: "Crie seu personagem" });

        await user.type(screen.getByLabelText("Nome"), "Ana");
        await user.type(screen.getByLabelText("Sobrenome"), "Silva");
        await user.click(screen.getByRole("button", { name: "Feminino" }));

        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));
    });
});
