import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MapSearchPanel } from "./MapSearchPanel";
import { useAuth } from "../../../auth/AuthContext";
import { searchLots, type Character } from "../../../lib/api";

vi.mock("../../../auth/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../../lib/api", async () => {
    const actual = await vi.importActual<typeof import("../../../lib/api")>("../../../lib/api");
    return { ...actual, searchLots: vi.fn() };
});

const DEBOUNCE_MS = 250;
const CHARACTER = { id: "char-1" } as Character;

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

        render(<MapSearchPanel character={CHARACTER} />);

        expect(screen.getByRole("button", { name: "Buscar lotes" })).toBeInTheDocument();
        expect(screen.queryByPlaceholderText("Buscar lote")).not.toBeInTheDocument();
    });

    it("shows the search input and results, with distance in blocks (from the backend) instead of coordinates", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: 5 },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel character={CHARACTER} />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByPlaceholderText("Buscar lote")).toBeInTheDocument();
        expect(screen.getByText("Ana Silva")).toBeInTheDocument();
        expect(screen.getByText(/Residência · 5m/)).toBeInTheDocument();
    });

    it("shows a placeholder distance when the backend has no home lot to compare against", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: null },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel character={CHARACTER} />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText(/Residência · —/)).toBeInTheDocument();
    });

    it("falls back to the lot's type name when there is no owner", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "", x: 0, y: 0, distanceBlocks: 0 },
        ]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel character={CHARACTER} />);
        await user.click(screen.getByRole("button", { name: "Buscar lotes" }));

        await act(async () => {
            vi.advanceTimersByTime(DEBOUNCE_MS);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.getByText("Residência")).toBeInTheDocument();
        expect(screen.getByText(/Residência · 0m/)).toBeInTheDocument();
    });

    it("shows an empty state when nothing matches", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([]);
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel character={CHARACTER} />);
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

        render(<MapSearchPanel character={CHARACTER} />);
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

        expect(searchLots).toHaveBeenLastCalledWith("token-123", "ana", "char-1");
    });

    it("logs the selected lot when a result is clicked", async () => {
        (searchLots as ReturnType<typeof vi.fn>).mockResolvedValue([
            { lotId: "lot-1", typeName: "Residência", ownerName: "Ana Silva", x: 3, y: 5, distanceBlocks: 5 },
        ]);
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        render(<MapSearchPanel character={CHARACTER} />);
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
