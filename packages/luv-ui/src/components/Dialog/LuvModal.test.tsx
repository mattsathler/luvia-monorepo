import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LuvModal } from "./LuvModal";

describe("LuvModal", () => {
    it("renders nothing when closed", () => {
        render(
            <LuvModal isOpen={false} onClose={vi.fn()}>
                Conteúdo
            </LuvModal>
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders the content when open", () => {
        render(
            <LuvModal isOpen onClose={vi.fn()}>
                Conteúdo qualquer
            </LuvModal>
        );

        expect(screen.getByRole("dialog")).toHaveTextContent("Conteúdo qualquer");
    });

    it("renders a title when provided", () => {
        render(
            <LuvModal isOpen onClose={vi.fn()} title="Confirmação">
                Conteúdo
            </LuvModal>
        );

        expect(screen.getByText("Confirmação")).toBeInTheDocument();
    });

    it("does not render a heading when no title is provided", () => {
        render(
            <LuvModal isOpen onClose={vi.fn()}>
                Conteúdo
            </LuvModal>
        );

        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("applies only the base dialog class for the default variant", () => {
        render(
            <LuvModal isOpen onClose={vi.fn()}>
                Conteúdo
            </LuvModal>
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("dialog");
        expect(dialog).not.toHaveClass("default");
    });

    it("applies a variant class when provided", () => {
        render(
            <LuvModal isOpen onClose={vi.fn()} variant="error">
                Conteúdo
            </LuvModal>
        );

        expect(screen.getByRole("dialog")).toHaveClass("error");
    });

    it("closes when clicking the backdrop by default", async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <LuvModal isOpen onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        await user.click(screen.getByRole("dialog").parentElement!);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not close when clicking the backdrop if disabled", async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <LuvModal isOpen onClose={onClose} closeOnBackdropClick={false}>
                Conteúdo
            </LuvModal>
        );

        await user.click(screen.getByRole("dialog").parentElement!);

        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not close when clicking inside the dialog content", async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <LuvModal isOpen onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        await user.click(screen.getByRole("dialog"));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("closes when clicking the close button", async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <LuvModal isOpen onClose={onClose} closeOnBackdropClick={false}>
                Conteúdo
            </LuvModal>
        );

        await user.click(screen.getByRole("button", { name: "Fechar" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape by default", () => {
        const onClose = vi.fn();
        render(
            <LuvModal isOpen onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignores other keys", () => {
        const onClose = vi.fn();
        render(
            <LuvModal isOpen onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        fireEvent.keyDown(document, { key: "Enter" });

        expect(onClose).not.toHaveBeenCalled();
    });

    it("does not close on Escape when disabled", () => {
        const onClose = vi.fn();
        render(
            <LuvModal isOpen onClose={onClose} closeOnEscape={false}>
                Conteúdo
            </LuvModal>
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).not.toHaveBeenCalled();
    });

    it("removes the Escape listener once closed", () => {
        const onClose = vi.fn();
        const { rerender } = render(
            <LuvModal isOpen onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        rerender(
            <LuvModal isOpen={false} onClose={onClose}>
                Conteúdo
            </LuvModal>
        );

        fireEvent.keyDown(document, { key: "Escape" });

        expect(onClose).not.toHaveBeenCalled();
    });
});
