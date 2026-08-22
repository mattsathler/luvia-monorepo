import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LuvExpandableBox } from "./LuvExpandableBox";

describe("LuvExpandableBox", () => {
    it("always renders the trigger, regardless of open state", () => {
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(screen.getByText("Rosto")).toBeInTheDocument();
    });

    it("starts closed by default, without the children in the document", () => {
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(screen.getByRole("button", { name: "Expandir perfil" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument();
    });

    it("starts open when defaultOpen is true", () => {
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" defaultOpen>
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(screen.getByRole("button", { name: "Expandir perfil" })).toHaveAttribute("aria-expanded", "true");
    });

    it("reveals the children when the trigger is clicked", async () => {
        const user = userEvent.setup();
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        await user.click(screen.getByRole("button", { name: "Expandir perfil" }));

        expect(screen.getByRole("button", { name: "Expandir perfil" })).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText("Rosto")).toBeInTheDocument();
        expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    });

    it("collapses the children again when the trigger is clicked a second time, keeping the trigger", async () => {
        const user = userEvent.setup();
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" defaultOpen>
                Conteúdo
            </LuvExpandableBox>,
        );

        const trigger = screen.getByRole("button", { name: "Expandir perfil" });
        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText("Rosto")).toBeInTheDocument();
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument();
    });

    it("keeps the collapse wrapper mounted while closed, so the width/height transition has a frame to animate from", () => {
        const { container } = render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.querySelector(".expandable-box-collapse")).toHaveClass("expandable-box-collapse--closed");
    });

    it("removes the surface's open gap modifier while closed, to avoid a phantom flex gap", () => {
        const { container } = render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.querySelector(".expandable-box-surface")).not.toHaveClass("expandable-box-surface--open");
    });

    it("does not render a close button while closed", () => {
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
    });

    it("closes when the close button is clicked, keeping the trigger", async () => {
        const user = userEvent.setup();
        render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" defaultOpen>
                Conteúdo
            </LuvExpandableBox>,
        );

        await user.click(screen.getByRole("button", { name: "Fechar" }));

        expect(screen.getByRole("button", { name: "Expandir perfil" })).toHaveAttribute("aria-expanded", "false");
        expect(screen.getByText("Rosto")).toBeInTheDocument();
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Fechar" })).not.toBeInTheDocument();
    });

    it("applies the given origin as a modifier class on the root", () => {
        const { container, rerender } = render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.firstElementChild).toHaveClass("expandable-box--origin-top-left");

        rerender(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" origin="bottom-right">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.firstElementChild).toHaveClass("expandable-box--origin-bottom-right");

        rerender(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" origin="bottom-center">
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.firstElementChild).toHaveClass("expandable-box--origin-bottom-center");
    });

    it("merges a custom className with the base surface classes", () => {
        const { container } = render(
            <LuvExpandableBox trigger={<span>Rosto</span>} triggerLabel="Expandir perfil" className="card max-w-480">
                Conteúdo
            </LuvExpandableBox>,
        );

        const surface = container.querySelector(".expandable-box-surface");
        expect(surface).toHaveClass("expandable-box-surface", "card", "max-w-480");
    });

    it("applies bodyClassName to the collapsible content wrapper only", () => {
        const { container } = render(
            <LuvExpandableBox
                trigger={<span>Rosto</span>}
                triggerLabel="Expandir perfil"
                className="max-w-480"
                bodyClassName="d-grid grid-cols-2"
                defaultOpen
            >
                Conteúdo
            </LuvExpandableBox>,
        );

        expect(container.querySelector(".expandable-box-body")).toHaveClass("expandable-box-body", "d-grid", "grid-cols-2");
        expect(container.querySelector(".expandable-box-surface")).not.toHaveClass("d-grid", "grid-cols-2");
    });
});
