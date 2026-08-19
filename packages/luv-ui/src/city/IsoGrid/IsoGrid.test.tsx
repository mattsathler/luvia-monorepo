import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IsoGrid } from "./IsoGrid";
import type { TileData } from "../../models/TileData";

describe("IsoGrid", () => {
    it("computes the iso bounding box and renders one Block per tile", () => {
        const tiles: TileData[] = [
            { x: 0, y: 0, z: 0, type: "grass" },
            { x: 1, y: 1, z: 0, type: "road-l" },
        ];

        const { container } = render(<IsoGrid tiles={tiles} tileSize={32} />);

        expect(container.querySelectorAll(".tile")).toHaveLength(2);

        const inner = container.querySelector(".iso-inner") as HTMLElement;
        expect(inner).toBeInTheDocument();
        expect(inner.style.width).not.toBe("");
        expect(inner.style.height).not.toBe("");
    });

    it("falls back to an undefined color/texture for an unknown tile type", () => {
        const tiles = [{ x: 0, y: 0, z: 0, type: "not-a-real-tile" }] as unknown as TileData[];

        const { container } = render(<IsoGrid tiles={tiles} tileSize={32} />);

        const tile = container.querySelector(".tile") as HTMLElement;
        expect(tile.style.getPropertyValue("--color")).toBe("transparent");
        expect(tile.style.getPropertyValue("--texture")).toBe("url(undefined)");
    });

    it("renders an empty grid for no tiles", () => {
        const { container } = render(<IsoGrid tiles={[]} tileSize={32} />);

        expect(container.querySelectorAll(".tile")).toHaveLength(0);
    });
});
