import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLotDetailModalController } from "./LotDetailModal.controller";
import { getCharacter } from "../../lib/api";
import type { Character, Lot } from "../../lib/api";

vi.mock("../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
    return { ...actual, getCharacter: vi.fn() };
});

const CURRENT_CHARACTER = { id: "char-1", firstName: "Ana", lastName: "Silva" } as Character;

describe("useLotDetailModalController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows the current character's own name without fetching, for their own lot", () => {
        const lot: Lot = { id: "lot-1", characterId: "char-1", type: "residential", x: 0, y: 0 };

        const { result } = renderHook(() =>
            useLotDetailModalController({ lot, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(result.current.isOwnLot).toBe(true);
        expect(result.current.ownerName).toBe("Ana Silva");
        expect(result.current.typeLabel).toBe("Residencial");
        expect(getCharacter).not.toHaveBeenCalled();
    });

    it("fetches and shows the owner's name for someone else's lot", async () => {
        const lot: Lot = { id: "lot-1", characterId: "char-2", type: "residential", x: 0, y: 0 };
        (getCharacter as ReturnType<typeof vi.fn>).mockResolvedValue({ firstName: "Bruno", lastName: "Costa" });

        const { result } = renderHook(() =>
            useLotDetailModalController({ lot, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(result.current.isOwnLot).toBe(false);
        expect(result.current.isLoadingOwner).toBe(true);

        await waitFor(() => expect(result.current.ownerName).toBe("Bruno Costa"));
        expect(result.current.isLoadingOwner).toBe(false);
        expect(getCharacter).toHaveBeenCalledWith("token", "char-2");
    });

    it("falls back to Prefeitura when fetching the owner fails", async () => {
        const lot: Lot = { id: "lot-1", characterId: "char-2", type: "residential", x: 0, y: 0 };
        (getCharacter as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network error"));

        const { result } = renderHook(() =>
            useLotDetailModalController({ lot, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        await waitFor(() => expect(result.current.ownerName).toBe("Prefeitura"));
        expect(result.current.isLoadingOwner).toBe(false);
    });

    it("does not fetch when there is no lot selected", () => {
        renderHook(() =>
            useLotDetailModalController({ lot: null, accessToken: "token", currentCharacter: CURRENT_CHARACTER }),
        );

        expect(getCharacter).not.toHaveBeenCalled();
    });
});
