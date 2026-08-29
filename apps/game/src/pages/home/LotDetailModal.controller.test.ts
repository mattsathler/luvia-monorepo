import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLotDetailModalController, type LotSelection } from "./LotDetailModal.controller";
import { getCharacter, getLotNeighborhood } from "../../lib/api";
import type { Character, Lot } from "../../lib/api";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getCharacter: vi.fn(), getLotNeighborhood: vi.fn() };
});

const CURRENT_CHARACTER = { id: "char-1", firstName: "Ana", lastName: "Silva" } as Character;

describe("useLotDetailModalController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (getLotNeighborhood as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it("shows the current character's own name without fetching, for their own lot", () => {
        const lot: Lot = { id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 };
        const selection: LotSelection = { x: 0, y: 0, lot };

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(result.current.isOwnLot).toBe(true);
        expect(result.current.ownerName).toBe("Ana Silva");
        expect(result.current.typeLabel).toBe("Residencial");
        expect(getCharacter).not.toHaveBeenCalled();
    });

    it("fetches and shows the owner's name for someone else's lot", async () => {
        const lot: Lot = { id: "lot-1", characterId: "char-2", type: "residential", x: 0, y: 0 };
        const selection: LotSelection = { x: 0, y: 0, lot };
        (getCharacter as ReturnType<typeof vi.fn>).mockResolvedValue({ firstName: "Bruno", lastName: "Costa" });

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(result.current.isOwnLot).toBe(false);
        expect(result.current.isLoadingOwner).toBe(true);

        await waitFor(() => expect(result.current.ownerName).toBe("Bruno Costa"));
        expect(result.current.isLoadingOwner).toBe(false);
        expect(getCharacter).toHaveBeenCalledWith("token", "char-2");
    });

    it("falls back to Prefeitura when fetching the owner fails", async () => {
        const lot: Lot = { id: "lot-1", characterId: "char-2", type: "residential", x: 0, y: 0 };
        const selection: LotSelection = { x: 0, y: 0, lot };
        (getCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        await waitFor(() => {
            expect(result.current.ownerName).toBe("Prefeitura");
            expect(result.current.isLoadingOwner).toBe(false);
        });
    });

    it("does not fetch when there is no selection", () => {
        renderHook(() =>
            useLotDetailModalController({ selection: null, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(getCharacter).not.toHaveBeenCalled();
        expect(getLotNeighborhood).not.toHaveBeenCalled();
    });

    it("shows the position as available, with no type, when the tile has no lot yet — every lot is inspectable", () => {
        const selection: LotSelection = { x: 3, y: 4, lot: null };

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(result.current.ownerName).toBe("Disponível");
        expect(result.current.typeLabel).toBeUndefined();
        expect(result.current.x).toBe(3);
        expect(result.current.y).toBe(4);
        expect(getCharacter).not.toHaveBeenCalled();
    });

    it("fetches the neighborhood for the selected position, excluding the lot itself", async () => {
        const lot: Lot = { id: "lot-1", characterId: "char-1", type: "residential", x: 5, y: 6 };
        const selection: LotSelection = { x: 5, y: 6, lot };
        (getLotNeighborhood as ReturnType<typeof vi.fn>).mockResolvedValue([
            { kind: "workplace", id: "wp-1", x: 6, y: 6, distanceBlocks: 1, buildingTypeId: "city-hall" },
            { kind: "lot", id: "lot-2", x: 3, y: 6, distanceBlocks: 2, ownerName: "Bruno Costa", typeName: "Residência" },
        ]);

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(getLotNeighborhood).toHaveBeenCalledWith("token", 5, 6, "lot-1");
        await waitFor(() => expect(result.current.neighborhood).toHaveLength(2));
        expect(result.current.neighborhood[0]).toMatchObject({ label: "Prefeitura", distanceMinutes: 1, icon: "work" });
        expect(result.current.neighborhood[1]).toMatchObject({
            label: "Residência de Bruno Costa",
            distanceMinutes: 2,
            icon: "home",
        });
    });

    it("picks a tip from the knowledge base", () => {
        const selection: LotSelection = { x: 0, y: 0, lot: null };

        const { result } = renderHook(() =>
            useLotDetailModalController({ selection, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(typeof result.current.tip).toBe("string");
        expect(result.current.tip.length).toBeGreaterThan(0);
    });
});
