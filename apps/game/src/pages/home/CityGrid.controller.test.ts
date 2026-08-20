import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHUNK_SIZE, buildChunkTiles, useCityGridController } from "./CityGrid.controller";
import { getCityChunk } from "../../lib/api";
import type { CityChunk } from "../../lib/api";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getCityChunk: vi.fn() };
});

describe("buildChunkTiles", () => {
    it("passes real terrain tiles through untouched when there is no lot at that position", () => {
        const chunk: CityChunk = {
            tiles: [
                { x: 0, y: 0, type: "road-r" },
                { x: 1, y: 0, type: "ocean" },
            ],
            lots: [],
        };

        expect(buildChunkTiles(chunk, "char-1")).toEqual([
            { x: 0, y: 0, z: 0, type: "road-r" },
            { x: 1, y: 0, z: 0, type: "ocean" },
        ]);
    });

    it("overrides the terrain tile with lot-mine/lot for the character's and other players' lots", () => {
        const chunk: CityChunk = {
            tiles: [
                { x: 0, y: 0, type: "grass" },
                { x: 1, y: 0, type: "grass" },
            ],
            lots: [
                { id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 },
                { id: "lot-2", characterId: "char-2", type: "residential", x: 1, y: 0 },
            ],
        };

        expect(buildChunkTiles(chunk, "char-1")).toEqual([
            { x: 0, y: 0, z: 0, type: "lot-mine" },
            { x: 1, y: 0, z: 0, type: "lot" },
        ]);
    });
});

describe("useCityGridController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function setup(dimensions = { width: 20, height: 10 }) {
        return renderHook(() =>
            useCityGridController({ dimensions, accessToken: "token-123", characterId: "char-1" }),
        );
    }

    it("computes chunk coordinates covering the whole grid, tolerating a non-multiple size", () => {
        const { result } = setup({ width: 15, height: 25 });

        // ceil(15/10) x ceil(25/10) = 2 x 3
        expect(result.current.chunkCoords).toHaveLength(6);
        expect(result.current.chunkCoords).toEqual(
            expect.arrayContaining([
                { chunkX: 0, chunkY: 0 },
                { chunkX: 1, chunkY: 2 },
            ]),
        );
    });

    it("starts with nothing mounted", () => {
        const { result } = setup();

        expect(result.current.tiles).toEqual([]);
    });

    it("fetches and mounts a chunk when it enters, and keeps it cached after leaving", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { result } = setup();

        act(() => result.current.onChunkEnter(0, 0));

        await waitFor(() => expect(result.current.tiles).toHaveLength(1));
        expect(getCityChunk).toHaveBeenCalledWith("token-123", 0, 0);
        expect(getCityChunk).toHaveBeenCalledTimes(1);

        act(() => result.current.onChunkLeave(0, 0));

        expect(result.current.tiles).toEqual([]);
    });

    it("entering an already-mounted chunk again is a no-op", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { result } = setup();

        act(() => result.current.onChunkEnter(0, 0));
        await waitFor(() => expect(result.current.tiles).toHaveLength(1));

        act(() => result.current.onChunkEnter(0, 0));

        expect(result.current.tiles).toHaveLength(1);
    });

    it("leaving a chunk that was never mounted is a no-op", () => {
        const { result } = setup();

        act(() => result.current.onChunkLeave(0, 0));

        expect(result.current.tiles).toEqual([]);
        expect(getCityChunk).not.toHaveBeenCalled();
    });

    it("re-entering a chunk that left does not fetch again (LOWYS's core guarantee)", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValue({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        const { result } = setup();

        act(() => result.current.onChunkEnter(0, 0));
        await waitFor(() => expect(result.current.tiles).toHaveLength(1));

        act(() => result.current.onChunkLeave(0, 0));
        expect(result.current.tiles).toEqual([]);

        act(() => result.current.onChunkEnter(0, 0));

        await waitFor(() => expect(result.current.tiles).toHaveLength(1));
        expect(getCityChunk).toHaveBeenCalledTimes(1);
    });

    it("mounts two independent chunks, each fetched only once", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockImplementation(async (_token, chunkX: number, chunkY: number) => ({
            tiles: [{ x: chunkX * CHUNK_SIZE, y: chunkY * CHUNK_SIZE, type: "grass" }],
            lots: [],
        }));

        const { result } = setup();

        act(() => {
            result.current.onChunkEnter(0, 0);
            result.current.onChunkEnter(1, 0);
        });

        await waitFor(() => expect(result.current.tiles).toHaveLength(2));
        expect(getCityChunk).toHaveBeenCalledTimes(2);
        expect(getCityChunk).toHaveBeenCalledWith("token-123", 0, 0);
        expect(getCityChunk).toHaveBeenCalledWith("token-123", 1, 0);
    });

    it("does not cache a chunk when the fetch fails, so a later entry retries it", async () => {
        (getCityChunk as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network error"));

        const { result } = setup();

        act(() => result.current.onChunkEnter(0, 0));
        await waitFor(() => expect(getCityChunk).toHaveBeenCalledTimes(1));
        expect(result.current.tiles).toEqual([]);

        (getCityChunk as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
            tiles: [{ x: 0, y: 0, type: "grass" }],
            lots: [],
        });

        act(() => result.current.onChunkLeave(0, 0));
        act(() => result.current.onChunkEnter(0, 0));

        await waitFor(() => expect(result.current.tiles).toHaveLength(1));
        expect(getCityChunk).toHaveBeenCalledTimes(2);
    });
});
