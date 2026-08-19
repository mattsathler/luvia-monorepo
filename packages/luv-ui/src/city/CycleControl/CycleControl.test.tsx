import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DayCycleControl } from "./CycleControl";

describe("DayCycleControl", () => {
    it("starts at noon and sets the sun CSS custom properties (cos(angle) > 0, no clamp)", () => {
        render(<DayCycleControl />);

        expect(screen.getByText("Hora: 12.0h")).toBeInTheDocument();
        expect(screen.getByRole("slider")).toHaveValue("12");

        const root = document.documentElement;
        expect(root.style.getPropertyValue("--sun-x")).toBe("0.5");
        expect(root.style.getPropertyValue("--sun-y")).toBe("1");
    });

    it("clamps --sun-y to 0 when the sun is below the horizon (cos(angle) < 0)", () => {
        render(<DayCycleControl />);

        fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });

        expect(screen.getByText("Hora: 0.0h")).toBeInTheDocument();
        expect(document.documentElement.style.getPropertyValue("--sun-y")).toBe("0");
    });
});
