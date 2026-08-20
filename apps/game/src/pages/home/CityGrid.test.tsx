import { act, render, screen, waitFor } from "@testing-library/react";
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
    });

    const dimensions = { width: 20, height: 10 }; // 2x1 chunks (CHUNK_SIZE = 10)

    it("renders one placeholder per chunk and no tiles before anything intersects", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
        );

        expect(container.querySelectorAll("[data-chunk-x]")).toHaveLength(2);
        expect(container.querySelectorAll(".tile")).toHaveLength(0);
    });

    it("observes with the shared IntersectionObserver rooted at the scroll container", () => {
        const { container } = render(
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
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
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
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
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
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
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
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
                accessToken="token-123"
                characterId="char-1"
                onTileClick={onTileClick}
                isTileClickable={(tile) => tile.type !== "road-r"}
            />,
        );

        act(() => FakeIntersectionObserver.instances[0].trigger(targetFor(0, 0), true));

        const buttons = await screen.findAllByRole("button");
        expect(buttons).toHaveLength(1);

        await user.click(buttons[0]);

        expect(onTileClick).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: 0 }));
    });

    it("disconnects the observer on unmount", () => {
        const { unmount } = render(
            <CityGrid dimensions={dimensions} tileSize={64} accessToken="token-123" characterId="char-1" />,
        );
        const observer = FakeIntersectionObserver.instances[0];

        unmount();

        expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
});
