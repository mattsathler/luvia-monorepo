import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThumbnailOption } from "./ThumbnailOption";

describe("ThumbnailOption", () => {
    const onSelect = vi.fn();

    it("renders the preview image, with the id as the only accessible name", () => {
        render(<ThumbnailOption id="3" previewSrc="tone-3_preview.png" isSelected onSelect={onSelect} />);

        const button = screen.getByRole("button", { name: "3" });
        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(button).toHaveClass("game-cyan");
        expect(screen.getByAltText("")).toHaveAttribute("src", "tone-3_preview.png");
    });

    it("uses the outline style when not selected", () => {
        render(<ThumbnailOption id="0" previewSrc="tone-0_preview.png" isSelected={false} onSelect={onSelect} />);

        const button = screen.getByRole("button", { name: "0" });
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(button).toHaveClass("outline");
        expect(button).not.toHaveClass("game-cyan");
    });

    it("calls onSelect when clicked", async () => {
        const user = userEvent.setup();
        render(<ThumbnailOption id="3" previewSrc="tone-3_preview.png" isSelected={false} onSelect={onSelect} />);

        await user.click(screen.getByRole("button", { name: "3" }));

        expect(onSelect).toHaveBeenCalledTimes(1);
    });
});
