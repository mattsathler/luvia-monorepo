import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThumbnailOption } from "./ThumbnailOption";
import { useTrimmedImage } from "../../lib/useTrimmedImage";

vi.mock("../../lib/useTrimmedImage", () => ({
    useTrimmedImage: vi.fn((src: string) => src),
}));

describe("ThumbnailOption", () => {
    const onSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useTrimmedImage as ReturnType<typeof vi.fn>).mockImplementation((src: string) => src);
    });

    it("renders the (trimmed) image, with the id as the only accessible name", () => {
        render(<ThumbnailOption id="3" imageSrc="tone-3.png" isSelected onSelect={onSelect} />);

        const button = screen.getByRole("button", { name: "3" });
        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(button.className).toBe("primary hidden");
        expect(screen.getByAltText("")).toHaveAttribute("src", "tone-3.png");
    });

    it("uses the outline style when not selected", () => {
        render(<ThumbnailOption id="0" imageSrc="tone-0.png" isSelected={false} onSelect={onSelect} />);

        const button = screen.getByRole("button", { name: "0" });
        expect(button).toHaveAttribute("aria-pressed", "false");
        expect(button.className).toBe("outline primary hidden");
    });

    it("calls onSelect when clicked", async () => {
        const user = userEvent.setup();
        render(<ThumbnailOption id="3" imageSrc="tone-3.png" isSelected={false} onSelect={onSelect} />);

        await user.click(screen.getByRole("button", { name: "3" }));

        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("trims the image by default", () => {
        render(<ThumbnailOption id="3" imageSrc="tone-3.png" isSelected={false} onSelect={onSelect} />);

        expect(useTrimmedImage).toHaveBeenCalledWith("tone-3.png", true);
    });

    it("skips trimming when trim is false", () => {
        render(
            <ThumbnailOption id="0" imageSrc="placeholder.svg" trim={false} isSelected={false} onSelect={onSelect} />,
        );

        expect(useTrimmedImage).toHaveBeenCalledWith("placeholder.svg", false);
    });
});
