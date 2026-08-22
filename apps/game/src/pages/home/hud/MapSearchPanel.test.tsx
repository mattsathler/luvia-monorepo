import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MapSearchPanel } from "./MapSearchPanel";
import { useAuth } from "../../../auth/AuthContext";
import { searchLots } from "../../../lib/api";

vi.mock("../../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../../lib/api")>("../../../lib/api");
    return { ...actual, searchLots: vi.fn() };
});

const DEBOUNCE_MS = 250;

describe("MapSearchPanel", () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: "token-123" });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it("starts closed, showing only the map trigger", () => {
        (searchLots as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

        render(<MapSearchPanel />);

        expect(screen.getByRole("button", { name: "Buscar lotes" })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Buscar lote")).not.toBeInTheDocument();
    });

    it("shows the search input and results once opened", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5 },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByPlaceholderText("Buscar lote")).toBeInTheDocument();
        expect(screen.getByText("Ana Silva")).toBeInTheDocument();
        expect(screen.getByText(/Residência · \(3, 5\)/)).toBeInTheDocument();
    });

    it("falls back to the lot's type name when there is no owner", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "", x: 0, y: 0 },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText("Residência")).toBeInTheDocument();
        expect(screen.getByText(/Residência · \(0, 0\)/)).toBeInTheDocument();
    });

    it("shows an empty state when nothing matches", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText("Nenhum lote encontrado.")).toBeInTheDocument();
    });

    it("re-searches with the typed query after the debounce", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));
        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
        });
        (searchLots as ReturnType<typeof vi.fn>).mockClear();

        await user.type(screen.getByPlaceholderText("Buscar lote"), "ana");
        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
        });

        expect(searchLots).toHaveBeenLastCalledWith("token-123", "ana");
    });

    it("logs the selected lot when a result is clicked", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5 },
        ]);
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));
        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        await user.click(screen.getByText("Ana Silva"));

        expect(logSpy).toHaveBeenCalledWith(
            "Navegar até o lote:",
            expect.objectContaining({ lotId: "lot-1", ownerName: "Ana Silva" }),
        );

        logSpy.mockRestore();
    });
});
