import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvIcon } from "./LuvIcon";

describe("LuvIcon", () => {
    describe("material icon fallback (name not in luv-icons)", () => {
        it("renders the icon ligature text hidden from assistive tech", () => {
            render(<LuvIcon name="arrow_back_ios_new" />);

            const icon = screen.getByText("arrow_back_ios_new");
            expect(icon).toHaveClass("material-icons");
            expect(icon).toHaveAttribute("aria-hidden", "true");
        });

        it("merges a custom className with the base classes", () => {
            render(<LuvIcon name="add" className="text-primary" />);

            const icon = screen.getByText("add");
            expect(icon).toHaveClass("material-icons", "luv-icon", "text-primary");
        });
    });

    describe("luv-icons svg (name matches a package icon)", () => {
        it("injects the svg markup instead of ligature text", () => {
            const { container } = render(<LuvIcon name="heart" />);

            const icon = container.querySelector(".luv-icon-svg");
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute("aria-hidden", "true");
            expect(icon).not.toHaveClass("material-icons");
            expect(icon?.querySelector("svg")).toBeInTheDocument();
        });

        it("merges a custom className with the base classes", () => {
            const { container } = render(<LuvIcon name="body" className="text-primary" />);

            const icon = container.querySelector(".luv-icon-svg");
            expect(icon).toHaveClass("luv-icon", "luv-icon-svg", "text-primary");
        });

        it("sizes the wrapper from the size prop, defaulting to 24", () => {
            const { container, rerender } = render(<LuvIcon name="heart" />);
            expect(container.querySelector(".luv-icon-svg")).toHaveStyle({ width: "24px", height: "24px" });

            rerender(<LuvIcon name="heart" size={16} />);
            expect(container.querySelector(".luv-icon-svg")).toHaveStyle({ width: "16px", height: "16px" });
        });
    });
});
