import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnackbarProvider } from "./SnackbarProvider";
import { showSnackbar } from "./snackbar";

describe("SnackbarProvider", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("renders a snackbar triggered from anywhere and animates it in", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Salvo com sucesso");
        });

        const toast = screen.getByRole("status");
        expect(toast).toHaveTextContent("Salvo com sucesso");
        expect(toast).not.toHaveClass("snackbar-visible");

        act(() => {
            vi.advanceTimersByTime(10);
        });

        expect(toast).toHaveClass("snackbar-visible");
    });

    it("applies only the base card styling when no variant is provided", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Mensagem padrão");
        });

        const toast = screen.getByRole("status");
        expect(toast).toHaveClass("card");
        expect(toast).not.toHaveClass("default");
    });

    it("applies a variant class when provided", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Erro ao salvar", { variant: "error" });
        });

        expect(screen.getByRole("status")).toHaveClass("error");
    });

    it("hides and then removes the snackbar after the given duration", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Mensagem temporária", { duration: 1000 });
        });

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(screen.getByRole("status")).not.toHaveClass("snackbar-visible");

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("uses the default duration when none is provided", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Sem duração customizada");
        });

        act(() => {
            vi.advanceTimersByTime(3000 + 300);
        });

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("renders multiple snackbars independently", () => {
        render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Primeira", { duration: 500 });
            showSnackbar("Segunda", { duration: 5000 });
        });

        expect(screen.getAllByRole("status")).toHaveLength(2);

        act(() => {
            vi.advanceTimersByTime(500 + 300);
        });

        expect(screen.getByRole("status")).toHaveTextContent("Segunda");
    });

    it("clears pending timers when unmounted before they fire", () => {
        const { unmount } = render(<SnackbarProvider />);

        act(() => {
            showSnackbar("Mensagem qualquer", { duration: 100 });
        });

        unmount();

        expect(() => {
            act(() => {
                vi.advanceTimersByTime(1000);
            });
        }).not.toThrow();
    });
});
