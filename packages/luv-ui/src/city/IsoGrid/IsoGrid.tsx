import "./IsoGrid.scss";
import { Block } from "../Block/Block";
import { TILE_TYPES } from "../Block/models/TilesTypes";
import type { TileData } from "../../models/TileData";

function getIsoBounds(tiles: TileData[], size: number) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    tiles.forEach(({ x, y }) => {
        const isoX = (x - y) * (size / 2);
        const isoY = (x + y) * (size / 4);

        minX = Math.min(minX, isoX);
        maxX = Math.max(maxX, isoX);
        minY = Math.min(minY, isoY);
        maxY = Math.max(maxY, isoY);
    });

    return {
        width: (maxX - minX) + size,
        height: (maxY - minY) + size,
        offsetX: -minX,
        offsetY: -minY + size * 2
    };
}


type IsoGridProps = {
    tiles: TileData[],
    tileSize: number,
    onTileClick?: (tile: TileData) => void,
    /** Se omitido, todo tile é clicável quando `onTileClick` é passado. */
    isTileClickable?: (tile: TileData) => boolean,
}

export function IsoGrid(props: IsoGridProps) {
    const { width, height, offsetX, offsetY } = getIsoBounds(props.tiles, props.tileSize);

    return (
        <div className="iso-grid scroll-auto h-full w-full">
            <div
                className="iso-inner"
                style={{
                    marginLeft: `${offsetX * 2}px`,
                    marginTop: `${offsetY}px`,
                    width,
                    height,
                    position: "relative",
                }}
            >
                {props.tiles.map((tile, i) => {
                    const clickable = Boolean(props.onTileClick) && (!props.isTileClickable || props.isTileClickable(tile));

                    return (
                        <Block key={i} {...tile} size={props.tileSize} color={TILE_TYPES[tile.type as keyof typeof TILE_TYPES]?.color}
                            texture={TILE_TYPES[tile.type as keyof typeof TILE_TYPES]?.texture}
                            onClick={clickable ? () => props.onTileClick!(tile) : undefined} />
                    );
                })}
            </div>
        </div>
    );
};