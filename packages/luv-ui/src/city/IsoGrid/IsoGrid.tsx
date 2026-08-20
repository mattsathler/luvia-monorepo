import { useEffect, useRef } from "react";
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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // O losango só toca o centro de cada lado da própria bounding box
        // (topo/base/esquerda/direita), nunca os 4 cantos dela — por isso a
        // posição de scroll padrão (0,0) não mostra tile nenhum. Centraliza
        // a área visível no meio do grid assim que ele monta (ou muda de
        // tamanho), pra aparecer conteúdo imediatamente.
        //
        // `.iso-inner` começa deslocado de `offsetX`/`offsetY` dentro de
        // `.iso-grid` (é isso que traz o tile mais à esquerda pra x=0
        // dentro do PRÓPRIO `.iso-inner`) — sem somar esse deslocamento
        // aqui, a rolagem centraliza em torno da caixa errada.
        const container = containerRef.current!;
        container.scrollLeft = Math.max(0, offsetX + width / 2 - container.clientWidth / 2);
        container.scrollTop = Math.max(0, offsetY + height / 2 - container.clientHeight / 2);
    }, [offsetX, offsetY, width, height]);

    return (
        <div ref={containerRef} className="iso-grid scroll-auto h-full w-full">
            <div
                className="iso-inner"
                style={{
                    // `offsetX` sozinho já traz o tile mais à esquerda (que
                    // tem `left: minX`, negativo) pra x=0 dentro da área de
                    // scroll — dobrar esse valor deixava um vão vazio do
                    // mesmo tamanho nas duas pontas do grid.
                    marginLeft: `${offsetX}px`,
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