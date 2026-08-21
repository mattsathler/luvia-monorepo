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

    // `hair_types`/`overlays` ficam de fora deste caso — sem PNG real ainda
    // (ver Pendências em docs/decisions/0020-...), então `getLayerSrc` nunca
    // resolve pra eles independente da posição no LAYER_ORDER.
    it("resolves each provided layer id to its asset src, in body -> face -> top -> pants -> shoes order", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ shoes: "0", pants: "0", tops: "0", body_types: "2", faces: "0" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith(
            [
                getLayerSrc("body_types", "2"),
                getLayerSrc("faces", "0"),
                getLayerSrc("tops", "0"),
                getLayerSrc("pants", "0"),
                getLayerSrc("shoes", "0"),
            ],
            undefined,
        );
    });

    it("skips categories that were not provided", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "0" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith([getLayerSrc("body_types", "0")], undefined);
    });

    it("skips a provided id that does not resolve to a known asset", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "99" }} />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith([], undefined);
    });

    it("restricts the composed region to head+neck when part is \"head\"", () => {
        (useComposedCharacterPreview as ReturnType<typeof vi.fn>).mockReturnValue(null);

        render(<Player layers={{ body_types: "0" }} part="head" />);

        expect(useComposedCharacterPreview).toHaveBeenCalledWith(
            [getLayerSrc("body_types", "0")],
            { minXFrac: 0, minYFrac: 0.08, maxXFrac: 1, maxYFrac: 0.53 },
        );
    });
});
