import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvIcon } from "./LuvIcon";

describe("LuvIcon", () => {
    it("renders the icon ligature text hidden from assistive tech", () => {
        render(<LuvIcon name="male" />);

        const icon = screen.getByText("male");
        expect(icon).toHaveClass("material-icons");
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("merges a custom className with the base classes", () => {
        render(<LuvIcon name="female" className="text-primary" />);

        const icon = screen.getByText("female");
        expect(icon).toHaveClass("material-icons", "luv-icon", "text-primary");
    });
});
