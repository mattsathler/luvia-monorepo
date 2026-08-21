import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LuvDropdownCard } from "./LuvDropdownCard";

describe("LuvDropdownCard", () => {
    it("renders the title and content when open by default", () => {
        render(<LuvDropdownCard title="Perfil">Conteúdo</LuvDropdownCard>);

        expect(screen.getByText("Perfil")).toBeInTheDocument();
        expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    });

    it("does not render a title when none is given", () => {
        render(<LuvDropdownCard>Conteúdo</LuvDropdownCard>);

        expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });

    it("marks the toggle button as expanded when open", () => {
        render(<LuvDropdownCard title="Perfil">Conteúdo</LuvDropdownCard>);

        expect(screen.getByRole("button", { name: "Minimizar" })).toHaveAttribute("aria-expanded", "true");
    });

    it("collapses the body when the toggle is clicked, without removing it from the DOM", async () => {
        const user = userEvent.setup();
        render(<LuvDropdownCard title="Perfil">Conteúdo</LuvDropdownCard>);

        await user.click(screen.getByRole("button", { name: "Minimizar" }));

        expect(screen.getByRole("button", { name: "Expandir" })).toHaveAttribute("aria-expanded", "false");
        // Colapsar é uma animação CSS (altura via grid-template-rows), não
        // desmontagem — o conteúdo continua na árvore.
        expect(screen.getByText("Conteúdo")).toBeInTheDocument();
    });

    it("expands again when the toggle is clicked a second time", async () => {
        const user = userEvent.setup();
        render(<LuvDropdownCard title="Perfil">Conteúdo</LuvDropdownCard>);

        const toggle = screen.getByRole("button", { name: "Minimizar" });
        await user.click(toggle);
        await user.click(screen.getByRole("button", { name: "Expandir" }));

        expect(screen.getByRole("button", { name: "Minimizar" })).toHaveAttribute("aria-expanded", "true");
    });

    it("starts closed when defaultOpen is false", () => {
        render(
            <LuvDropdownCard title="Perfil" defaultOpen={false}>
                Conteúdo
            </LuvDropdownCard>,
        );

        expect(screen.getByRole("button", { name: "Expandir" })).toHaveAttribute("aria-expanded", "false");
    });

    it("merges a custom className with the base card classes", () => {
        const { container } = render(
            <LuvDropdownCard title="Perfil" className="max-w-480">
                Conteúdo
            </LuvDropdownCard>,
        );

        expect(container.firstElementChild).toHaveClass("card", "dropdown-card", "max-w-480");
    });

    it("applies bodyClassName to the content wrapper, separately from className on the outer card", () => {
        const { container } = render(
            <LuvDropdownCard title="Perfil" className="max-w-480" bodyClassName="d-grid grid-cols-2">
                Conteúdo
            </LuvDropdownCard>,
        );

        expect(container.querySelector(".dropdown-card-body")).toHaveClass("dropdown-card-body", "d-grid", "grid-cols-2");
        expect(container.firstElementChild).not.toHaveClass("d-grid", "grid-cols-2");
    });
});
