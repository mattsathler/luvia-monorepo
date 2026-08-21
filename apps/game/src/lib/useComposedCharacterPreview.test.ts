import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useComposedCharacterPreview } from "./useComposedCharacterPreview";
import { composeAndTrimLayers } from "./image-trim";

vi.mock("./image-trim", () => ({
    composeAndTrimLayers: vi.fn(),
}));

describe("useComposedCharacterPreview", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null until the composite is ready, then the composed image", async () => {
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockResolvedValue("data:image/png;base64,composed");

        const { result } = renderHook(() => useComposedCharacterPreview(["body.png", "face.png"]));

        expect(result.current).toBeNull();

        await waitFor(() => expect(result.current).toBe("data:image/png;base64,composed"));
        expect(composeAndTrimLayers).toHaveBeenCalledWith(["body.png", "face.png"], undefined);
    });

    it("forwards the region to composeAndTrimLayers", async () => {
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockResolvedValue("data:image/png;base64,composed");
        const region = { minXFrac: 0, minYFrac: 0.08, maxXFrac: 1, maxYFrac: 0.53 };

        const { result } = renderHook(() => useComposedCharacterPreview(["body.png"], region));

        await waitFor(() => expect(result.current).toBe("data:image/png;base64,composed"));
        expect(composeAndTrimLayers).toHaveBeenCalledWith(["body.png"], region);
    });

    it("returns null when composing fails", async () => {
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useComposedCharacterPreview(["body.png"]));

        await waitFor(() => expect(composeAndTrimLayers).toHaveBeenCalled());
        expect(result.current).toBeNull();
    });

    it("recomposes when the layers change", async () => {
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockImplementation(async (layers: string[]) =>
            `composed:${layers.join(",")}`,
        );

        const { result, rerender } = renderHook(({ layers }) => useComposedCharacterPreview(layers), {
            initialProps: { layers: ["body-0.png"] },
        });

        await waitFor(() => expect(result.current).toBe("composed:body-0.png"));

        rerender({ layers: ["body-1.png"] });

        await waitFor(() => expect(result.current).toBe("composed:body-1.png"));
        expect(composeAndTrimLayers).toHaveBeenCalledTimes(2);
    });

    it("does not update state after unmount when composing resolves late", async () => {
        let resolveCompose!: (value: string) => void;
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise<string>((resolve) => {
                resolveCompose = resolve;
            }),
        );

        const { unmount } = renderHook(() => useComposedCharacterPreview(["body.png"]));
        unmount();
        resolveCompose("composed.png");

        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("does not update state after unmount when composing rejects late", async () => {
        let rejectCompose!: (error: Error) => void;
        (composeAndTrimLayers as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise<string>((_resolve, reject) => {
                rejectCompose = reject;
            }),
        );

        const { unmount } = renderHook(() => useComposedCharacterPreview(["body.png"]));
        unmount();
        rejectCompose(new Error("boom"));

        await new Promise((resolve) => setTimeout(resolve, 0));
    });
});
