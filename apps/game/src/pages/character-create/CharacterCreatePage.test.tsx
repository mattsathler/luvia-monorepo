import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterCreatePage } from "./CharacterCreatePage";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, createCharacter, listSkills, type Character, type SkillDefinition } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/api")>();
    return {
        ...actual,
        listSkills: vi.fn(),
        createCharacter: vi.fn(),
    };
});

vi.mock("../../lib/useTrimmedImage", () => ({
    useTrimmedImage: (src: string) => src,
}));

vi.mock("../../lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: () => null,
}));

const SKILLS: SkillDefinition[] = [
    { id: "intelligence", label: "Inteligência" },
    { id: "charisma", label: "Carisma" },
];

const CHARACTER: Character = {
    id: "char-1",
    accountId: "acc-1",
    firstName: "Ana",
    lastName: "Silva",
    gender: "female",
    skills: { intelligence: 4, charisma: 0 },
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

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("Sobrenome"), "Silva");
    await user.click(screen.getByRole("button", { name: "Feminino" }));
    await user.click(screen.getByRole("button", { name: "3" }));
}

describe("CharacterCreatePage", () => {
    const onCharacterCreated = vi.fn();
    const onCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token" });
    });

    it("renders nothing when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        const { container } = render(
            <CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />,
        );

        expect(container).toBeEmptyDOMElement();
        expect(listSkills).not.toHaveBeenCalled();
    });

    it("shows an error when the skill catalog fails to load", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);

        expect(
            await screen.findByText("Não foi possível carregar as skills. Tente novamente."),
        ).toBeInTheDocument();
    });

    it("keeps the submit button disabled until identity, appearance and all skill points are set", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");

        const submit = screen.getByRole("button", { name: "Criar personagem" });
        expect(submit).toBeDisabled();

        await fillIdentity(user);
        expect(submit).toBeDisabled(); // no skill points allocated yet

        await user.click(screen.getByRole("button", { name: "Aumentar Inteligência" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Inteligência" }));
        await user.click(screen.getByRole("button", { name: "Aumentar Carisma" }));
        expect(submit).toBeDisabled(); // only 3 of 4 points allocated

        await user.click(screen.getByRole("button", { name: "Aumentar Carisma" }));
        expect(submit).toBeEnabled();
    });

    it("does not let the player allocate more than the point budget", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");

        const increment = screen.getByRole("button", { name: "Aumentar Inteligência" });
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);

        expect(increment).toBeDisabled();
        expect(screen.getByRole("button", { name: "Aumentar Carisma" })).toBeDisabled();
    });

    it("lets the player take back an allocated point", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");

        const decrement = screen.getByRole("button", { name: "Diminuir Inteligência" });
        expect(decrement).toBeDisabled();

        await user.click(screen.getByRole("button", { name: "Aumentar Inteligência" }));
        expect(decrement).toBeEnabled();

        await user.click(decrement);
        expect(decrement).toBeDisabled();
    });

    it("submits the full payload and reports the created character", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        (createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");
        await fillIdentity(user);

        const increment = screen.getByRole("button", { name: "Aumentar Inteligência" });
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);

        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(createCharacter).toHaveBeenCalledWith("token", {
            firstName: "Ana",
            lastName: "Silva",
            gender: "female",
            skinTone: 3,
            hairType: "0",
            eyeType: "0",
            skills: { intelligence: 4, charisma: 0 },
        });
        expect(onCharacterCreated).toHaveBeenCalledWith(CHARACTER);
    });

    it("shows the server error message when creation fails", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError("Invalid initial skill allocation"));
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");
        await fillIdentity(user);

        const increment = screen.getByRole("button", { name: "Aumentar Inteligência" });
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(await screen.findByText("Invalid initial skill allocation")).toBeInTheDocument();
        expect(onCharacterCreated).not.toHaveBeenCalled();
    });

    it("shows a generic error message when creation fails for an unexpected reason", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await screen.findByText("Inteligência");
        await fillIdentity(user);

        const increment = screen.getByRole("button", { name: "Aumentar Inteligência" });
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(increment);
        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(
            await screen.findByText("Não foi possível criar seu personagem. Tente novamente."),
        ).toBeInTheDocument();
    });

    it("calls onCancel when Voltar is clicked", async () => {
        (listSkills as ReturnType<typeof vi.fn>).mockResolvedValue(SKILLS);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await user.click(screen.getByRole("button", { name: "Voltar" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
