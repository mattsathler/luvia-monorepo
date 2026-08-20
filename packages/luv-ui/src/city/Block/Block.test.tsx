import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
        expect(tile.className).toContain("isometric");
    });

    it("is not marked clickable and has no button semantics when onClick is not provided", () => {
        const { container } = render(<Block texture="grass.png" />);

        const tile = container.querySelector(".tile") as HTMLElement;
        expect(tile.className).not.toContain("clickable");
        expect(tile.className).not.toContain("isometric");
        expect(tile).not.toHaveAttribute("role");
        expect(tile).not.toHaveAttribute("tabindex");
    });

    it("calls onClick when clicked, and is marked clickable with button semantics", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Block texture="grass.png" onClick={onClick} />);

        const tile = screen.getByRole("button");
        expect(tile.className).toContain("clickable");
        expect(tile).toHaveAttribute("tabindex", "0");

        await user.click(tile);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("calls onClick on Enter or Space when focused", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Block texture="grass.png" onClick={onClick} />);

        const tile = screen.getByRole("button");
        tile.focus();

        await user.keyboard("{Enter}");
        await user.keyboard(" ");

        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("ignores other keys", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Block texture="grass.png" onClick={onClick} />);

        screen.getByRole("button").focus();
        await user.keyboard("{Escape}");

        expect(onClick).not.toHaveBeenCalled();
    });
});
