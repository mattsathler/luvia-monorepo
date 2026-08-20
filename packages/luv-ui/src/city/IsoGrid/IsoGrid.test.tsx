import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

    it("does not make tiles clickable when onTileClick is not provided", () => {
        const tiles: TileData[] = [{ x: 0, y: 0, z: 0, type: "grass" }];
        const { container } = render(<IsoGrid tiles={tiles} tileSize={32} />);

        expect(container.querySelector(".tile.clickable")).not.toBeInTheDocument();
    });

    it("calls onTileClick with the clicked tile's data", async () => {
        const user = userEvent.setup();
        const onTileClick = vi.fn();
        const tiles: TileData[] = [
            { x: 0, y: 0, z: 0, type: "grass" },
            { x: 1, y: 1, z: 0, type: "road-l" },
        ];

        render(<IsoGrid tiles={tiles} tileSize={32} onTileClick={onTileClick} />);

        const [, second] = screen.getAllByRole("button");
        await user.click(second);

        expect(onTileClick).toHaveBeenCalledTimes(1);
        expect(onTileClick).toHaveBeenCalledWith(tiles[1]);
    });

    it("only makes tiles clickable when isTileClickable allows it", async () => {
        const user = userEvent.setup();
        const onTileClick = vi.fn();
        const tiles: TileData[] = [
            { x: 0, y: 0, z: 0, type: "grass" },
            { x: 1, y: 1, z: 0, type: "road-l" },
        ];

        const { container } = render(
            <IsoGrid tiles={tiles} tileSize={32} onTileClick={onTileClick} isTileClickable={(tile) => tile.type !== "road-l"} />,
        );

        expect(screen.getAllByRole("button")).toHaveLength(1);

        const roadTile = container.querySelectorAll(".tile")[1];
        expect(roadTile.className).not.toContain("clickable");

        await user.click(screen.getByRole("button"));

        expect(onTileClick).toHaveBeenCalledWith(tiles[0]);
    });
});
