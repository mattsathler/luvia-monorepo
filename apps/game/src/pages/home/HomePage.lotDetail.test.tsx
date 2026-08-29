import { act, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";
import { useAuth } from "../../auth/AuthContext";
import { getCharacter, getCity, getCityChunk, getCurrentLot, getLotNeighborhood } from "../../lib/api";
import type { Character, City } from "../../lib/api";

// Diferente de HomePage.test.tsx (que mocka CityGrid inteiro — ver o
// comentário lá), este arquivo monta CityGrid e LotDetailModal de verdade:
// é o único jeito de cobrir a cadeia clique-no-tile -> getLotAt ->
// handleTileClick -> selectedLot -> LotDetailModal ponta a ponta. Sem isso,
// um erro de integração entre essas peças (ex.: nome de prop trocado,
// clickable mal calculado) passaria despercebido mesmo com toda peça
// testada isoladamente.
vi.mock("../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return {
        ...actual,
        getCurrentLot: vi.fn(),
        getCity: vi.fn(),
        getCityChunk: vi.fn(),
        getCharacter: vi.fn(),
        getLotNeighborhood: vi.fn(),
    };
});

vi.mock("./useWorldClock", () => ({ useWorldClock: vi.fn(() => null) }));
vi.mock("./useWorldClockLighting", () => ({ useWorldClockLighting: vi.fn() }));

// Mesmo fake usado em CityGrid.test.tsx — jsdom não implementa
// IntersectionObserver, e é ele quem decide quais chunks montam de verdade.
class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = [];
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    disconnect = vi.fn();
    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        FakeIntersectionObserver.instances.push(this);
    }
    observe(element: Element) {
        this.observed.push(element);
    }
    unobserve() {}
    trigger(target: Element, isIntersecting: boolean) {
        this.callback([{ target, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
    }
}

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

const CITY: City = { width: 20, height: 10, backgroundColor: "#7bc96f" };

async function openMap() {
    const { container } = render(
        <MemoryRouter>
            <HomePage character={CHARACTER} />
        </MemoryRouter>,
    );

    await screen.findByRole("button", { name: "Buscar lotes" });
    await waitFor(() => expect(FakeIntersectionObserver.instances).toHaveLength(1));

    const observer = FakeIntersectionObserver.instances[0];
    const placeholder = observer.observed.find(
        (el) => el.getAttribute("data-chunk-x") === "0" && el.getAttribute("data-chunk-y") === "0",
    )!;

    await act(async () => {
        observer.trigger(placeholder, true);
        await Promise.resolve();
        await Promise.resolve();
    });

    return container;
}

describe("HomePage — clicking a lot on the real map opens LotDetailModal", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        FakeIntersectionObserver.instances = [];
        vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
        (getCurrentLot as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "Residência", x: 0, y: 0 });
        (getCity as ReturnType<typeof vi.fn>).mockResolvedValue(CITY);
        (getLotNeighborhood as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it("opens the modal with the owner's name for another character's lot", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [{ id: "lot-1", characterId: "char-2", type: "residential", x: 0, y: 0 }],
        });
        (getCharacter as ReturnType<typeof vi.fn>).mockResolvedValue({ ...CHARACTER, id: "char-2", firstName: "Beto", lastName: "Costa" });

        const container = await openMap();
        const tile = container.querySelector(".tile.clickable") as HTMLElement;
        expect(tile).not.toBeNull();

        await act(async () => {
            tile.click();
        });

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText("Inspecionar lote")).toBeInTheDocument();
        expect(await within(dialog).findByText("Beto Costa")).toBeInTheDocument();
    });

    it("opens the modal for the current character's own lot, without fetching an owner", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [{ id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 }],
        });

        const container = await openMap();
        const tile = container.querySelector(".tile.clickable") as HTMLElement;

        await act(async () => {
            tile.click();
        });

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText("Ana Silva")).toBeInTheDocument();
        expect(getCharacter).not.toHaveBeenCalled();
    });

    it("closes the modal when the close button is clicked", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [{ id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 }],
        });

        const container = await openMap();
        const tile = container.querySelector(".tile.clickable") as HTMLElement;

        await act(async () => {
            tile.click();
        });
        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();

        await act(async () => {
            within(dialog).getByRole("button", { name: "Fechar" }).click();
        });

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens the modal as available, with no owner, when clicking a lot that was never claimed", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const container = await openMap();
        const tile = container.querySelector(".tile.clickable") as HTMLElement;
        expect(tile).not.toBeNull();

        await act(async () => {
            tile.click();
        });

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText("Disponível")).toBeInTheDocument();
        expect(getCharacter).not.toHaveBeenCalled();
    });
});
