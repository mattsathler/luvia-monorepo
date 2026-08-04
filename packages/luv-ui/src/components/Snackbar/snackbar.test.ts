import { describe, expect, it, vi } from "vitest";
import { showSnackbar, subscribeSnackbar } from "./snackbar";

describe("snackbar bus", () => {
    it("notifies subscribers with sensible defaults", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSnackbar(listener);

        showSnackbar("Oi");

        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Oi", duration: 3000, variant: "default" })
        );

        unsubscribe();
    });

    it("respects a custom duration and variant", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSnackbar(listener);

        showSnackbar("Erro ao salvar", { duration: 1000, variant: "error" });

        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({ message: "Erro ao salvar", duration: 1000, variant: "error" })
        );

        unsubscribe();
    });

    it("stops notifying after unsubscribing", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSnackbar(listener);
        unsubscribe();

        showSnackbar("Oi de novo");

        expect(listener).not.toHaveBeenCalled();
    });

    it("generates a unique id for each call", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeSnackbar(listener);

        showSnackbar("Primeira");
        showSnackbar("Segunda");

        const [[first], [second]] = listener.mock.calls;
        expect(first.id).not.toBe(second.id);

        unsubscribe();
    });
});
