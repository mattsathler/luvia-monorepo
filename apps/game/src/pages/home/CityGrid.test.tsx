import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CityGrid } from "./CityGrid";
import { getCityChunk } from "../../lib/api";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getCityChunk: vi.fn() };
});

class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = [];
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    disconnect = vi.fn();
    root: Element | Document | null;
    rootMargin: string;

    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.callback = callback;
        this.root = (options?.root as Element | Document | null) ?? null;
        this.rootMargin = options?.rootMargin ?? "";
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

// jsdom não implementa o construtor `PointerEvent` (só `Event`), então
// `fireEvent.pointerDown/Move/Up` do RTL cai pro `Event` genérico, que
// ignora `pointerId`/`clientX`/`clientY`/`button` do init dict — o handler
// do componente lê essas props como `undefined` e descarta o gesto. Monta
// o evento na mão e atribui essas props diretamente nele (React lê do
// evento nativo, não recria os valores), simulando o que um `PointerEvent`
// de verdade daria.
function firePointerEvent(target: Element, type: string, init: { pointerId: number; clientX: number; clientY: number; button?: number }) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { button: 0, ...init });
    fireEvent(target, event);
}

function targetFor(chunkX: number, chunkY: number): Element {
    const instance = FakeIntersectionObserver.instances[0];
    const target = instance.observed.find(
        (el) => el.getAttribute("data-chunk-x") === String(chunkX) && el.getAttribute("data-chunk-y") === String(chunkY),
    );
    if (!target) throw new Error(`no placeholder observed for chunk ${chunkX},${chunkY}`);
    return target;
}

describe("CityGrid", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        FakeIntersectionObserver.instances = [];
        vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
        // jsdom não implementa `Element#scrollTo` — sem isso, o efeito de
        // navegação até `targetLot` (CityGrid.tsx) lança ao chamar
        // `container.scrollTo(...)`, mesmo em testes que não mexem com ele.
        Element.prototype.scrollTo = vi.fn();
    });

    const dimensions = { width: 20, height: 10 }; // 2x1 chunks (CHUNK_SIZE = 10)

    it("renders one placeholder per chunk and no tiles before anything intersects", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        expect(container.querySelectorAll("[data-chunk-x]")).toHaveLength(2);
        expect(container.querySelectorAll(".tile")).toHaveLength(0);
    });

    it("centers the scroll position on mount, since the diamond shape only touches the middle of each bounding-box edge, never a corner", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;

        // width=960/height=512/offsetX=288/offsetY=0 pra dimensions=20x10,
        // tileSize=64 (mesma fórmula de getGridIsoBounds) — o centro do
        // conteúdo, em coordenadas de `.iso-grid`, é offsetX + width/2 (não
        // só width/2: `.iso-inner` começa deslocado de offsetX dentro de
        // `.iso-grid`). jsdom não faz layout de verdade, então
        // clientWidth/clientHeight ficam 0.
        expect(grid.scrollLeft).toBe(768);
        expect(grid.scrollTop).toBe(256);
    });

    it("exposes the given background color via --color, so IsoGrid.scss can shade it by sun position like the tiles", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        expect((container.querySelector(".iso-grid") as HTMLElement).style.getPropertyValue("--color")).toBe("#7bc96f");
    });

    it("observes with the shared IntersectionObserver rooted at the scroll container", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        expect(FakeIntersectionObserver.instances).toHaveLength(1);
        const instance = FakeIntersectionObserver.instances[0];
        expect(instance.root).toBe(container.querySelector(".iso-grid"));
        expect(instance.rootMargin).toBe("640px");
        expect(instance.observed).toHaveLength(2);
    });

    it("fetches and mounts a chunk's tiles when its placeholder intersects", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        act(() => FakeIntersectionObserver.instances[0].trigger(targetFor(0, 0), true));

        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));
        expect(getCityChunk).toHaveBeenCalledWith("token-123", 0, 0);
    });

    it("unmounts a chunk's tiles when it stops intersecting, and re-fetching does not happen on re-entry", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );
        const observer = FakeIntersectionObserver.instances[0];
        const target = targetFor(0, 0);

        act(() => observer.trigger(target, true));
        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));

        act(() => observer.trigger(target, false));
        expect(container.querySelectorAll(".tile")).toHaveLength(0);

        act(() => observer.trigger(target, true));
        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));

        expect(getCityChunk).toHaveBeenCalledTimes(1);
    });

    it("mounts two chunks independently, one fetch each", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockImplementation(async (_token, chunkX: number) => ({
            tiles: [{ x: chunkX * 10, y: 0, type: "grass" }],
            lots: [],
        }));

        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );
        const observer = FakeIntersectionObserver.instances[0];

        act(() => {
            observer.trigger(targetFor(0, 0), true);
            observer.trigger(targetFor(1, 0), true);
        });

        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(2));
        expect(getCityChunk).toHaveBeenCalledTimes(2);
    });

    it("clicking a mounted, clickable tile calls onTileClick; isTileClickable gates it", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [
                { x: 0, y: 0, type: "grass" },
                { x: 1, y: 0, type: "road-r" },
            ],
            lots: [],
        });
        const onTileClick = vi.fn();
        const user = userEvent.setup();

        render(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={false}
                onTileClick={onTileClick}
                isTileClickable={(tile) => tile.type !== "road-r"}
            />,
        );

        act(() => FakeIntersectionObserver.instances[0].trigger(targetFor(0, 0), true));

        const buttons = await screen.findAllByRole("button");
        expect(buttons).toHaveLength(1);

        await user.click(buttons[0]);

        expect(onTileClick).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: 0 }), undefined);
    });

    it("hides the native scrollbar and disables native touch panning when drag mode is on, since scrolling happens via drag", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={true} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;

        expect(grid).toHaveClass("no-scrollbar");
        expect(grid).toHaveClass("touch-none");
        expect(grid).toHaveClass("cursor-grab");
    });

    it("keeps native touch panning and the default cursor when drag mode is off", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;

        expect(grid).toHaveClass("no-scrollbar");
        expect(grid).not.toHaveClass("touch-none");
        expect(grid).not.toHaveClass("cursor-grab");
    });

    it("pans the map by dragging the pointer, once drag mode is on", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={true} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;
        const startScrollLeft = grid.scrollLeft;
        const startScrollTop = grid.scrollTop;

        firePointerEvent(grid, "pointerdown", { pointerId: 1, button: 0, clientX: 200, clientY: 200 });
        firePointerEvent(grid, "pointermove", { pointerId: 1, clientX: 170, clientY: 220 });

        expect(grid.scrollLeft).toBe(startScrollLeft + 30);
        expect(grid.scrollTop).toBe(startScrollTop - 20);
        expect(grid).toHaveClass("cursor-grabbing");

        firePointerEvent(grid, "pointerup", { pointerId: 1, clientX: 170, clientY: 220 });

        expect(grid).toHaveClass("cursor-grab");
    });

    it("does not pan the map when drag mode is off, even with pointer movement", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;
        const startScrollLeft = grid.scrollLeft;
        const startScrollTop = grid.scrollTop;

        firePointerEvent(grid, "pointerdown", { pointerId: 1, button: 0, clientX: 200, clientY: 200 });
        firePointerEvent(grid, "pointermove", { pointerId: 1, clientX: 170, clientY: 220 });

        expect(grid.scrollLeft).toBe(startScrollLeft);
        expect(grid.scrollTop).toBe(startScrollTop);
        expect(grid).not.toHaveClass("cursor-grabbing");
    });

    it("stops panning once the pointer is released, even though the mouse keeps the same pointerId across gestures", () => {
        // Bug real: como o mouse (ao contrário do touch) reusa o mesmo
        // pointerId entre gestos separados, um `pointermove` sem o botão
        // pressionado (o usuário só passou o cursor por cima do mapa depois
        // de soltar) tinha o mesmo `pointerId` do arrasto anterior e era
        // lido como sua continuação, arrastando o mapa sozinho.
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={true} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;

        firePointerEvent(grid, "pointerdown", { pointerId: 1, button: 0, clientX: 200, clientY: 200 });
        firePointerEvent(grid, "pointermove", { pointerId: 1, clientX: 170, clientY: 220 });
        firePointerEvent(grid, "pointerup", { pointerId: 1, clientX: 170, clientY: 220 });

        const scrollLeftAfterRelease = grid.scrollLeft;
        const scrollTopAfterRelease = grid.scrollTop;

        firePointerEvent(grid, "pointermove", { pointerId: 1, clientX: 100, clientY: 260 });

        expect(grid.scrollLeft).toBe(scrollLeftAfterRelease);
        expect(grid.scrollTop).toBe(scrollTopAfterRelease);
    });

    it("disables tile clickability entirely while drag mode is on — no click, hover, or keyboard focus affordance", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });
        const onTileClick = vi.fn();

        const { container } = render(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={true}
                onTileClick={onTileClick}
            />,
        );

        act(() => FakeIntersectionObserver.instances[0].trigger(targetFor(0, 0), true));
        await waitFor(() => expect(container.querySelector(".tile")).not.toBeNull());
        const tile = container.querySelector(".tile") as HTMLElement;
        const grid = container.querySelector(".iso-grid") as HTMLElement;

        // Sem `onClick`, o Block nem vira `role="button"` — o hover/pop de
        // "clicável" (Block.scss `.tile.clickable`) some junto, e Enter no
        // tile (que não passa pelo handleClickCapture) também não faz nada.
        expect(tile).not.toHaveClass("clickable");
        expect(tile).not.toHaveAttribute("role", "button");

        firePointerEvent(grid, "pointerdown", { pointerId: 1, button: 0, clientX: 200, clientY: 200 });
        firePointerEvent(grid, "pointerup", { pointerId: 1, clientX: 200, clientY: 200 });
        fireEvent.click(tile);

        expect(onTileClick).not.toHaveBeenCalled();
    });

    it("smoothly scrolls to a targetLot whose chunk is already loaded, without refetching", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { container, rerender } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        act(() => FakeIntersectionObserver.instances[0].trigger(targetFor(0, 0), true));
        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));
        (getCityChunk as ReturnType<typeof vi.fn>).mockClear();

        const grid = container.querySelector(".iso-grid") as HTMLElement;
        const scrollToSpy = vi.fn();
        grid.scrollTo = scrollToSpy;

        rerender(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={false}
                targetLot={{ x: 2, y: 1 }}
            />,
        );

        await waitFor(() => expect(scrollToSpy).toHaveBeenCalledTimes(1));
        expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
        expect(getCityChunk).not.toHaveBeenCalled();
    });

    it("fetches the chunk first, then jumps (no animation) to a targetLot in an unloaded chunk", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 12, y: 3, type: "grass" }],
            lots: [],
        });

        const { container, rerender } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;
        const scrollToSpy = vi.fn();
        grid.scrollTo = scrollToSpy;

        rerender(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={false}
                targetLot={{ x: 12, y: 3 }}
            />,
        );

        await waitFor(() => expect(getCityChunk).toHaveBeenCalledWith("token-123", 1, 0));
        await waitFor(() => expect(scrollToSpy).toHaveBeenCalledTimes(1));
        expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
        await waitFor(() => expect(container.querySelectorAll(".tile")).toHaveLength(1));
    });

    it("does not re-navigate to the same targetLot on an unrelated re-render", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { container, rerender } = render(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={false}
                targetLot={{ x: 0, y: 0 }}
            />,
        );

        const grid = container.querySelector(".iso-grid") as HTMLElement;
        await waitFor(() => expect(getCityChunk).toHaveBeenCalledTimes(1));

        const scrollToSpy = vi.fn();
        grid.scrollTo = scrollToSpy;

        rerender(
            <CityGrid
                dimensions={dimensions}
                tileSize={64}
                backgroundColor="#7bc96f"
                accessToken="token-123"
                characterId="char-1"
                dragModeEnabled={false}
                targetLot={{ x: 0, y: 0 }}
                onTileClick={vi.fn()}
            />,
        );

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it("disconnects the observer on unmount", () => {
        const { unmount } = render(
            <CityGrid dimensions={dimensions} tileSize={64} backgroundColor="#7bc96f" accessToken="token-123" characterId="char-1" dragModeEnabled={false} />,
        );
        const observer = FakeIntersectionObserver.instances[0];

        unmount();

        expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
});
