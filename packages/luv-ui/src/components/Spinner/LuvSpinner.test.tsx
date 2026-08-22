import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvSpinner } from "./LuvSpinner";

describe("LuvSpinner", () => {
    it("has an accessible status role with a default label", () => {
        render(<LuvSpinner />);

        expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Carregando");
    });

    it("uses the given label as both the aria-label and the visible caption", () => {
        render(<LuvSpinner label="Carregando cidade..." />);

        expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Carregando cidade...");
        expect(screen.getByText("Carregando cidade...")).toBeInTheDocument();
    });

    it("does not render a caption when no label is given", () => {
        const { container } = render(<LuvSpinner />);

        expect(container.querySelector("span.text-text")).not.toBeInTheDocument();
    });

    it("applies the given color as a CSS variable", () => {
        const { container } = render(<LuvSpinner color="primary" />);

        expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--luv-spinner-color")).toBe(
            "var(--primary)",
        );
    });

    it("merges a custom className with the base class", () => {
        const { container } = render(<LuvSpinner className="justify-center" />);

        expect(container.firstElementChild).toHaveClass("luv-spinner", "justify-center");
    });
});
