import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterCreatePage } from "./CharacterCreatePage";
import { useAuth } from "../../auth/AuthContext";
import { ApiError, createCharacter, updateAppearance, type Character } from "../../lib/api";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/api")>();
    return {
        ...actual,
        createCharacter: vi.fn(),
        updateAppearance: vi.fn(),
    };
});

vi.mock("../../lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: () => null,
}));

// Personagem nasce sem nenhuma skill alocada (nível 0 em tudo) — ver
// docs/decisions/0024-personagem-nasce-sem-skills.md.
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

async function fillIdentity(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Nome"), "Ana");
    await user.type(screen.getByLabelText("Sobrenome"), "Silva");
    await user.click(screen.getByRole("button", { name: "Feminino" }));
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
    });

    it("keeps the submit button disabled until identity is filled", async () => {
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);

        const submit = screen.getByRole("button", { name: "Criar personagem" });
        expect(submit).toBeDisabled();

        await fillIdentity(user);
        expect(submit).toBeEnabled();
    });

    it("submits the full payload without any skill allocation and reports the created character", async () => {
        (createCharacter as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        (updateAppearance as ReturnType<typeof vi.fn>).mockResolvedValue(CHARACTER);
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await fillIdentity(user);

        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(createCharacter).toHaveBeenCalledWith("token", {
            firstName: "Ana",
            lastName: "Silva",
            gender: "female",
            skinTone: 3,
            hairType: "0",
            eyeType: "0",
        });
        expect(updateAppearance).toHaveBeenCalledWith("token", CHARACTER.id, {
            face: "0",
            top: "0",
            pants: "0",
            shoes: "0",
            overlay: "0",
        });
        expect(onCharacterCreated).toHaveBeenCalledWith(CHARACTER);
    });

    it("shows the server error message when creation fails", async () => {
        (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new ApiError("Nome já usado por outro personagem seu"));
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await fillIdentity(user);
        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(await screen.findByText("Nome já usado por outro personagem seu")).toBeInTheDocument();
        expect(onCharacterCreated).not.toHaveBeenCalled();
    });

    it("shows a generic error message when creation fails for an unexpected reason", async () => {
        (createCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await fillIdentity(user);
        await user.click(screen.getByRole("button", { name: "Criar personagem" }));

        expect(
            await screen.findByText("Não foi possível criar seu personagem. Tente novamente."),
        ).toBeInTheDocument();
    });

    it("calls onCancel when Voltar is clicked", async () => {
        const user = userEvent.setup();

        render(<CharacterCreatePage onCharacterCreated={onCharacterCreated} onCancel={onCancel} />);
        await user.click(screen.getByRole("button", { name: "Voltar para seleção de personagens" }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
