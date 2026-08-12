import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Player } from "./Player";
import { useComposedCharacterPreview } from "../../lib/useComposedCharacterPreview";
import { getLayerSrc } from "../../lib/character-assets";

vi.mock("../../lib/useComposedCharacterPreview", () => ({
    useComposedCharacterPreview: vi.fn(),
}));

describe("Player", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("shows a loading message while the composite is not ready", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "0" }} />);

        expect(screen.getByText("Montando personagem...")).toBeInTheDocument();
    });

    it("shows the composed image once ready", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue("data:image/png;base64,composed");

        render(<Player layers={{ body_types: "0" }} />);

        expect(screen.getByAltText("Personagem")).toHaveAttribute("src", "data:image/png;base64,composed");
    });

    it("resolves each provided layer id to its asset src, in body -> face -> pants -> shoes -> top order", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ tops: "0", shoes: "0", pants: "0", body_types: "2", faces: "0" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith([
            getLayerSrc("body_types", "2"),
            getLayerSrc("faces", "0"),
            getLayerSrc("pants", "0"),
            getLayerSrc("shoes", "0"),
            getLayerSrc("tops", "0"),
        ]);
    });

    it("skips categories that were not provided", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "0" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith([getLayerSrc("body_types", "0")]);
    });

    it("skips a provided id that does not resolve to a known asset", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "99" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith([]);
    });
});
