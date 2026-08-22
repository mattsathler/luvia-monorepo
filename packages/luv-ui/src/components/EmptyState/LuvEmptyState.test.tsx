import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvEmptyState } from "./LuvEmptyState";

describe("LuvEmptyState", () => {
    it("renders the icon and the message", () => {
        render(<LuvEmptyState icon="search_off" message="Nenhum lote encontrado." />);

        expect(screen.getByText("search_off")).toBeInTheDocument();
        expect(screen.getByText("Nenhum lote encontrado.")).toBeInTheDocument();
    });

    it("takes up the full width of its container", () => {
        const { container } = render(<LuvEmptyState icon="search_off" message="Vazio" />);

        expect(container.firstElementChild).toHaveClass("empty-state");
    });

    it("merges a custom className with the base class", () => {
        const { container } = render(<LuvEmptyState icon="search_off" message="Vazio" className="py-24" />);

        expect(container.firstElementChild).toHaveClass("empty-state", "py-24");
    });
});
