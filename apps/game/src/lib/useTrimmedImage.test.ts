import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTrimmedImage } from "./useTrimmedImage";
import { trimTransparentPadding } from "./image-trim";

vi.mock("./image-trim", () => ({
    trimTransparentPadding: vi.fn(),
}));

describe("useTrimmedImage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the original src immediately, then the trimmed result once ready", async () => {
        (trimTransparentPadding as ReturnType<typeof vi.fn>).mockResolvedValue("trimmed.png");

        const { result } = renderHook(() => useTrimmedImage("original.png"));

        expect(result.current).toBe("original.png");

        await waitFor(() => expect(result.current).toBe("trimmed.png"));
    });

    it("keeps the original src when trimming fails", async () => {
        (trimTransparentPadding as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

        const { result } = renderHook(() => useTrimmedImage("original.png"));

        await waitFor(() => expect(trimTransparentPadding).toHaveBeenCalled());
        expect(result.current).toBe("original.png");
    });

    it("re-trims when the src changes", async () => {
        (trimTransparentPadding as ReturnType<typeof vi.fn>).mockImplementation(async (src: string) => `trimmed-${src}`);

        const { result, rerender } = renderHook(({ src }) => useTrimmedImage(src), {
            initialProps: { src: "a.png" },
        });

        await waitFor(() => expect(result.current).toBe("trimmed-a.png"));

        rerender({ src: "b.png" });
        expect(result.current).toBe("b.png");
        await waitFor(() => expect(result.current).toBe("trimmed-b.png"));
    });

    it("skips trimming entirely when disabled", () => {
        const { result } = renderHook(() => useTrimmedImage("placeholder.svg", false));

        expect(result.current).toBe("placeholder.svg");
        expect(trimTransparentPadding).not.toHaveBeenCalled();
    });

    it("does not update state after unmount when trimming resolves late", async () => {
        let resolveTrim!: (value: string) => void;
        (trimTransparentPadding as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise<string>((resolve) => {
                resolveTrim = resolve;
            }),
        );

        const { unmount } = renderHook(() => useTrimmedImage("a.png"));
        unmount();
        resolveTrim("trimmed-a.png");

        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    it("does not update state after unmount when trimming rejects late", async () => {
        let rejectTrim!: (error: Error) => void;
        (trimTransparentPadding as ReturnType<typeof vi.fn>).mockReturnValue(
            new Promise<string>((_resolve, reject) => {
                rejectTrim = reject;
            }),
        );

        const { unmount } = renderHook(() => useTrimmedImage("a.png"));
        unmount();
        rejectTrim(new Error("boom"));

        await new Promise((resolve) => setTimeout(resolve, 0));
    });
});
