import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CharacterSelectPage } from "./CharacterSelectPage";
import { useAuth } from "../../auth/AuthContext";
import { listMyCharacters, type Character } from "../../lib/api";
import { useComposedCharacterPreview } from "../../lib/useComposedCharacterPreview";
import { getLayerSrc } from "../../lib/character-assets";

vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../../lib/api")>();
    return {
        ...actual,
        listMyCharacters: vi.fn(),
    };
});

vi.mock("../../lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: vi.fn(() => null),
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

describe("CharacterSelectPage", () => {
    const onCharacterSelected = vi.fn();
    const onCreateNew = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token" });
    });

    it("lists the account's characters once loaded", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);

        expect(await screen.findByRole("button", { name: "Ana Silva" })).toBeInTheDocument();
    });

    it("shows each character's preview alongside their name", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue("data:image/png;base64,composed");

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);

        const card = await screen.findByRole("button", { name: "Ana Silva" });
        expect(within(card).getByAltText("Personagem")).toHaveAttribute("src", "data:image/png;base64,composed");
        expect(useComposedCharacterPreview).toHaveBeenCalledWith([
            getLayerSrc("body_types", "3"),
            getLayerSrc("faces", "0"),
            getLayerSrc("tops", "0"),
            getLayerSrc("pants", "0"),
            getLayerSrc("shoes", "0"),
            getLayerSrc("overlays", "0"),
        ]);
    });

    it("selects a character when clicked", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);
        await user.click(await screen.findByRole("button", { name: "Ana Silva" }));

        expect(onCharacterSelected).toHaveBeenCalledWith(CHARACTER);
    });

    it("selects a character via keyboard (Enter/Space)", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);
        (await screen.findByRole("button", { name: "Ana Silva" })).focus();
        await user.keyboard("{Enter}");

        expect(onCharacterSelected).toHaveBeenCalledWith(CHARACTER);
    });

    it("ignores unrelated keys on a character card", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);
        (await screen.findByRole("button", { name: "Ana Silva" })).focus();
        await user.keyboard("a");

        expect(onCharacterSelected).not.toHaveBeenCalled();
    });

    it("shows an error when the character list fails to load", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);

        expect(
            await screen.findByText("Não foi possível carregar seus personagens. Tente novamente."),
        ).toBeInTheDocument();
    });

    it("shows an empty state when the account has no characters", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([]);

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);

        expect(await screen.findByText("Você ainda não tem nenhum personagem.")).toBeInTheDocument();
    });

    it("requests character creation when the create button is clicked", async () => {
        (listMyCharacters as ReturnType<typeof vi.fn>).mockResolvedValue([CHARACTER]);
        const user = userEvent.setup();

        render(<CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />);
        await user.click(await screen.findByRole("button", { name: "Criar novo personagem" }));

        expect(onCreateNew).toHaveBeenCalledTimes(1);
    });

    it("renders nothing when there is no access token", () => {
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: null });

        const { container } = render(
            <CharacterSelectPage onCharacterSelected={onCharacterSelected} onCreateNew={onCreateNew} />,
        );

        expect(container).toBeEmptyDOMElement();
        expect(listMyCharacters).not.toHaveBeenCalled();
    });
});
