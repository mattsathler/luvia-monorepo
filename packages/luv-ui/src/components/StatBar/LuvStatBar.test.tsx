import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LuvStatBar } from "./LuvStatBar";

describe("LuvStatBar", () => {
    it("shows the label and the value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        expect(screen.getByText("Energia")).toBeInTheDocument();
        expect(screen.getByText("70/100")).toBeInTheDocument();
    });

    it("renders 10 dots total", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        const container = screen.getByText("70/100").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot")).toHaveLength(10);
    });

    it("fills dots proportionally to value/max", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={70} max={100} />);

        const container = screen.getByText("70/100").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot--filled")).toHaveLength(7);
    });

    it("rounds to the nearest dot", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={24} max={100} />);

        const container = screen.getByText("24/100").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot--filled")).toHaveLength(2);
    });

    it("clamps the filled dots between 0 and 10", () => {
        const { rerender } = render(<LuvStatBar icon="bolt" label="Energia" value={150} max={100} />);
        let container = screen.getByText("150/100").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot--filled")).toHaveLength(10);

        rerender(<LuvStatBar icon="bolt" label="Energia" value={-10} max={100} />);
        container = screen.getByText("-10/100").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot--filled")).toHaveLength(0);
    });

    it("shows no filled dots when max is 0", () => {
        render(<LuvStatBar icon="bolt" label="Energia" value={0} max={0} />);

        const container = screen.getByText("0/0").closest(".luv-stat-bar")!;
        expect(container.querySelectorAll(".luv-stat-bar-dot--filled")).toHaveLength(0);
    });

    it("applies the given color as a CSS variable", () => {
        const { container } = render(<LuvStatBar icon="bolt" label="Energia" value={50} max={100} color="game-green" />);

        expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--luv-stat-bar-color")).toBe(
            "var(--game-green)",
        );
    });
});
