import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvDivider } from "./LuvDivider";

describe("LuvDivider", () => {
    it("defaults to horizontal", () => {
        render(<LuvDivider />);

        const divider = screen.getByRole("separator");
        expect(divider).toHaveClass("luv-divider", "horizontal");
        expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("renders vertical when asked", () => {
        render(<LuvDivider orientation="vertical" />);

        const divider = screen.getByRole("separator");
        expect(divider).toHaveClass("luv-divider", "vertical");
        expect(divider).toHaveAttribute("aria-orientation", "vertical");
    });

    it("forwards a custom className", () => {
        render(<LuvDivider className="my-8" />);

        expect(screen.getByRole("separator")).toHaveClass("luv-divider", "horizontal", "my-8");
    });
});
