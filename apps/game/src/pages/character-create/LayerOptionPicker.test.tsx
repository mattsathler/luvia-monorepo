import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LayerOptionPicker } from "./LayerOptionPicker";
import { getLayerAssets } from "../../lib/character-assets";

vi.mock("../../lib/character-assets", () => ({
    getLayerAssets: vi.fn(),
}));

describe("LayerOptionPicker", () => {
    const onSelect = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders nothing when the category has no assets", () => {
        (getLayerAssets as ReturnType<typeof vi.fn>).mockReturnValue([]);

        const { container } = render(
            <LayerOptionPicker category="hair_types" selectedId="0" onSelect={onSelect} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("renders one thumbnail per available option", () => {
        (getLayerAssets as ReturnType<typeof vi.fn>).mockReturnValue([
            { id: "0", src: "hair-0.png", previewSrc: "hair-0_preview.png" },
            { id: "1", src: "hair-1.png", previewSrc: "hair-1_preview.png" },
        ]);

        render(<LayerOptionPicker category="hair_types" selectedId="0" onSelect={onSelect} />);

        expect(screen.getByRole("button", { name: "0" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-pressed", "false");
    });

    it("calls onSelect with the clicked option's id", async () => {
        (getLayerAssets as ReturnType<typeof vi.fn>).mockReturnValue([
            { id: "0", src: "hair-0.png", previewSrc: "hair-0_preview.png" },
            { id: "1", src: "hair-1.png", previewSrc: "hair-1_preview.png" },
        ]);
        const user = userEvent.setup();

        render(<LayerOptionPicker category="hair_types" selectedId="0" onSelect={onSelect} />);
        await user.click(screen.getByRole("button", { name: "1" }));

        expect(onSelect).toHaveBeenCalledWith("1");
    });
});
