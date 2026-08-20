import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvStatBar } from "./LuvStatBar";

describe("LuvStatBar", () => {
    it("shows the label and the value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        expect(screen.getByText("Energia")).toBeInTheDocument();
        expect(screen.getByText("70/100")).toBeInTheDocument();
    });

    it("fills proportionally to value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={25} max={100} />);

        const track = screen.getByText("25/100").closest(".luv-stat-bar")!;
        const fill = track.querySelector(".luv-stat-bar-fill") as HTMLElement;

        expect(fill.style.width).toBe("25%");
    });

    it("clamps the fill between 0 and 100 percent", () => {
        const { rerender } = render(<LuvStatBar icon="bolt" label="Energia" value={150} max={100} />);
        let fill = document.querySelector(".luv-stat-bar-fill") as HTMLElement;
        expect(fill.style.width).toBe("100%");

        rerender(<LuvStatBar icon="bolt" label="Energia" value={-10} max={100} />);
        fill = document.querySelector(".luv-stat-bar-fill") as HTMLElement;
        expect(fill.style.width).toBe("0%");
    });
});
