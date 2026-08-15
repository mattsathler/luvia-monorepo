import { render, screen } from "@testing-library/react";
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

vi.mock("./lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof api>();
    return {
        ...actual,
        login: vi.fn(),
        authFetch: vi.fn(),
        listMyCharacters: vi.fn(),
        listSkills: vi.fn(),
        createCharacter: vi.fn(),
        updateAppearance: vi.fn(),
    };
});

vi.mock("./lib/useTrimmedImage", () => ({
    useTrimmedImage: (src: string) => src,
}));

vi.mock("./lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: () => null,
}));

const SKILLS: api.SkillDefinition[] = [
    { id: "intelligence", label: "Inteligência" },
    { id: "charisma", label: "Carisma" },
    { id: "creativity", label: "Criatividade" },
    { id: "strength", label: "Força" },
];

describe("App", () => {
    beforeEach(() => {
        clearStoredToken();
        vi.clearAllMocks();
        window.history.pushState(null, "", "/");
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

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Ana Silva" }));

        expect(await screen.findByText("Você está logado como Ana Silva.")).toBeInTheDocument();
    });

    it("returns to character selection when the player changes character", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Ana Silva" }));
        await screen.findByText("Você está logado como Ana Silva.");

        await user.click(screen.getByRole("button", { name: "Voltar para seleção de personagens" }));

        expect(await screen.findByRole("heading", { name: "Selecione seu personagem" })).toBeInTheDocument();
    });

    it("logs out and returns to the login page", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Ana Silva" }));
        await screen.findByText("Você está logado como Ana Silva.");

        await user.click(screen.getByRole("button", { name: "Sair" }));

        expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    });

    it("navigates to the dedicated character creation page and back", async () => {
        setStoredToken("stored-token");
        (api.authFetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true } as Response);
        (api.listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        (api.listSkills as ReturnType<typeof vi.fn>).mockResolvedValue([]);
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
        (api.listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        (api.createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        (api.updateAppearance as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        const user = userEvent.setup();

        render(<App />);
        await user.click(await screen.findByRole("button", { name: "Criar novo personagem" }));
        await screen.findByRole("heading", { name: "Crie seu personagem" });

        await user.type(screen.getByLabelText("Nome"), "Ana");
        await user.type(screen.getByLabelText("Sobrenome"), "Silva");
        await user.click(screen.getByRole("button", { name: "Feminino" }));

        await user.click(screen.getByRole("button", { name: "Skills" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Inteligência" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Inteligência" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Carisma" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Carisma" }));
        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(await screen.findByText("Você está logado como Ana Silva.")).toBeInTheDocument();
    });
});
