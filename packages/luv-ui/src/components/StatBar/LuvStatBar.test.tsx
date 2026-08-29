import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvStatBar } from "./LuvStatBar";

describe("LuvStatBar", () => {
    it("shows the label and the value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        expect(screen.getByText("Energia")).toBeInTheDocument();
        expect(screen.getByText("70/100")).toBeInTheDocument();
    });

    it("fills the bar proportionally to value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        const container = screen.getByText("70/100").closest(".luv-stat-bar")!;
        const fill = container.querySelector(".luv-stat-bar-fill") as HTMLElement;
        expect(fill.style.width).toBe("70%");
    });

    it("clamps the fill width between 0% and 100%", () => {
        const { rerender } = render(<LuvStatBar icon="bolt" label="Energia" value={150} max={100} />);
        let container = screen.getByText("150/100").closest(".luv-stat-bar")!;
        expect((container.querySelector(".luv-stat-bar-fill") as HTMLElement).style.width).toBe("100%");

        rerender(<LuvStatBar icon="bolt" label="Energia" value={-10} max={100} />);
        container = screen.getByText("-10/100").closest(".luv-stat-bar")!;
        expect((container.querySelector(".luv-stat-bar-fill") as HTMLElement).style.width).toBe("0%");
    });

    it("shows no fill when max is 0", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={0} max={0} />);

        const container = screen.getByText("0/0").closest(".luv-stat-bar")!;
        expect((container.querySelector(".luv-stat-bar-fill") as HTMLElement).style.width).toBe("0%");
    });

    it("applies the given color as a CSS variable", () => {
        const { container } = render(<LuvStatBar icon="bolt" label="Energia" value={50} max={100} color="game-green" />);

        expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--luv-stat-bar-color")).toBe(
            "var(--game-green)",
        );
    });
});
