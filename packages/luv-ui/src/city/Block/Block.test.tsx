import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Block } from "./Block";

describe("Block", () => {
    it("renders only the top face by default, with default color/size/position", () => {
        const { container } = render(<Block texture="grass.png" />);

        const tile = container.querySelector(".tile") as HTMLElement;
        expect(tile).toBeInTheDocument();
        expect(tile.style.getPropertyValue("--color")).toBe("transparent");
        expect(tile.style.getPropertyValue("--size")).toBe("32px");
        expect(tile.style.getPropertyValue("--x")).toBe("0");
        expect(tile.style.getPropertyValue("--y")).toBe("0");
        expect(tile.style.getPropertyValue("--z")).toBe("0");
        expect(tile.style.getPropertyValue("--texture")).toBe("url(grass.png)");
        expect(container.querySelector(".face.top")).toBeInTheDocument();
        expect(container.querySelector(".face.left")).not.toBeInTheDocument();
        expect(container.querySelector(".face.right")).not.toBeInTheDocument();
    });

    it("renders the left/right faces and custom props when isometric", () => {
        const { container } = render(
            <Block texture="road.png" color="#123456" size={64} x={1} y={2} z={3} isometric />,
        );

        const tile = container.querySelector(".tile") as HTMLElement;
        expect(tile.style.getPropertyValue("--color")).toBe("#123456");
        expect(tile.style.getPropertyValue("--size")).toBe("64px");
        expect(tile.style.getPropertyValue("--x")).toBe("1");
        expect(tile.style.getPropertyValue("--y")).toBe("2");
        expect(tile.style.getPropertyValue("--z")).toBe("3");
        expect(container.querySelector(".face.left")).toBeInTheDocument();
        expect(container.querySelector(".face.right")).toBeInTheDocument();
    });
});
