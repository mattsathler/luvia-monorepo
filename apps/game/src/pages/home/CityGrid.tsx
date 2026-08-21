import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Block, TILE_TYPES } from "luv-ui";
import type { TileData } from "luv-ui";
import { CHUNK_SIZE, useCityGridController } from "./CityGrid.controller";

/** ~1 chunk de buffer em todas as direções — ver docs/technical/lowys-carregamento-em-chunks.md. */
const PREFETCH_MARGIN = "640px";

/**
 * Distância mínima (px) que o ponteiro precisa se mover, a partir do
 * pointerdown, pra um gesto virar "arrastar o mapa" em vez de "clicar num
 * tile" — sem isso, todo clique (mesmo parado) dispararia um `scrollLeft`/
 * `scrollTop` de ~0px, e um tremor de mão de 1-2px num clique real seria
 * interpretado como arrasto e engoliria o clique do tile.
 */
const DRAG_THRESHOLD_PX = 6;

type DragState = {
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
    /** Só vira `true` depois que o movimento passa de `DRAG_THRESHOLD_PX` — é o que diferencia arrasto de clique. */
    dragged: boolean;
};

function isoCornersBoundingBox(corners: { x: number; y: number }[], size: number) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    corners.forEach(({ x, y }) => {
        const isoX = (x - y) * (size / 2);
        const isoY = (x + y) * (size / 4);
        minX = Math.min(minX, isoX);
        maxX = Math.max(maxX, isoX);
        minY = Math.min(minY, isoY);
        maxY = Math.max(maxY, isoY);
    });

    return { minX, maxX, minY, maxY };
}

/**
 * Mesma fórmula de IsoGrid#getIsoBounds (packages/luv-ui), só que calculada
 * a partir dos 4 cantos da grade em vez de escanear todos os tiles — LOWYS
 * não busca a cidade inteira, só sabe as dimensões (ver CityGrid.controller.ts).
 */
function getGridIsoBounds(width: number, height: number, size: number) {
    const { minX, maxX, minY, maxY } = isoCornersBoundingBox(
        [
            { x: 0, y: 0 },
            { x: width - 1, y: 0 },
            { x: 0, y: height - 1 },
            { x: width - 1, y: height - 1 },
        ],
        size,
    );

    return {
        width: maxX - minX + size,
        height: maxY - minY + size,
        offsetX: -minX,
        // Sem buffer extra: o tile plano (z=0) já tem a ponta do losango na
        // própria borda superior da sua caixa (Block.scss — clip-path
        // começa em "50% 0%"), então nenhum espaço a mais é necessário
        // acima do primeiro tile. Se um dia houver conteúdo elevado (z > 0,
        // prédios), revisitar com um buffer dimensionado pro z máximo real.
        offsetY: -minY,
    };
}

/** Retângulo (em pixels, mesmo espaço de coordenadas dos tiles) que envolve um chunk. */
function getChunkPixelBox(chunkX: number, chunkY: number, gridWidth: number, gridHeight: number, size: number) {
    const minTileX = chunkX * CHUNK_SIZE;
    const minTileY = chunkY * CHUNK_SIZE;
    const maxTileX = Math.min(minTileX + CHUNK_SIZE, gridWidth) - 1;
    const maxTileY = Math.min(minTileY + CHUNK_SIZE, gridHeight) - 1;

    const { minX, maxX, minY, maxY } = isoCornersBoundingBox(
        [
            { x: minTileX, y: minTileY },
            { x: maxTileX, y: minTileY },
            { x: minTileX, y: maxTileY },
            { x: maxTileX, y: maxTileY },
        ],
        size,
    );

    return { left: minX, top: minY, width: maxX - minX + size, height: maxY - minY + size };
}

type CityGridProps = {
    dimensions: { width: number; height: number };
    tileSize: number;
    /** Hex, vem do doc da cidade (ver apps/api CityMap#backgroundColor) — não fixo aqui, pra permitir biomas diferentes no futuro. */
    backgroundColor: string;
    accessToken: string;
    characterId: string;
    onTileClick?: (tile: TileData) => void;
    isTileClickable?: (tile: TileData) => boolean;
};

/**
 * LOWYS (Load Only What You See) — ver docs/technical/lowys-carregamento-em-chunks.md.
 * Um placeholder por chunk cobre a grade inteira desde o início (pra a área
 * de scroll ter o tamanho certo); um `IntersectionObserver` compartilhado
 * decide quais chunks estão visíveis (+ margem) e só esses têm seus tiles
 * de verdade montados como `Block` — os demais ficam só como placeholder,
 * mas seus dados continuam em cache (ver CityGrid.controller.ts).
 */
export function CityGrid({
    dimensions,
    tileSize,
    backgroundColor,
    accessToken,
    characterId,
    onTileClick,
    isTileClickable,
}: CityGridProps) {
    const { chunkCoords, tiles, onChunkEnter, onChunkLeave } = useCityGridController({
        dimensions,
        accessToken,
        characterId,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const placeholderRefs = useRef(new Map<string, HTMLDivElement>());
    const dragRef = useRef<DragState | null>(null);
    /** Sobrevive um tick além de `dragRef` — só existe pro `click` pós-arrasto (ver `endDrag`/`handleClickCapture`). */
    const wasDraggedRef = useRef(false);

    const bounds = useMemo(
        () => getGridIsoBounds(dimensions.width, dimensions.height, tileSize),
        [dimensions.width, dimensions.height, tileSize],
    );

    useEffect(() => {
        // O losango só toca o centro de cada lado da própria bounding box
        // (topo/base/esquerda/direita), nunca os 4 cantos dela — por isso a
        // posição de scroll padrão (0,0), que mostra o canto superior
        // esquerdo da bounding box, não mostra tile nenhum. Centraliza a
        // área visível no meio do mapa assim que ele monta (ou quando muda
        // de tamanho, ex. zoom), pra aparecer conteúdo imediatamente em vez
        // de exigir rolagem manual.
        //
        // `.iso-inner` (que carrega o conteúdo em si) começa deslocado de
        // `bounds.offsetX`/`bounds.offsetY` dentro de `.iso-grid` (o
        // container que rola) — é isso que traz o tile mais à esquerda para
        // x=0 dentro do PRÓPRIO `.iso-inner`. Sem somar esse deslocamento
        // aqui, o cálculo centraliza a rolagem em torno da caixa errada
        // (como se `.iso-inner` começasse em x=0 de `.iso-grid`) e erra o
        // centro visual do mapa por exatamente esse deslocamento.
        const container = containerRef.current!;
        container.scrollLeft = Math.max(0, bounds.offsetX + bounds.width / 2 - container.clientWidth / 2);
        container.scrollTop = Math.max(0, bounds.offsetY + bounds.height / 2 - container.clientHeight / 2);
    }, [bounds.offsetX, bounds.offsetY, bounds.width, bounds.height]);

    useEffect(() => {
        // O ref já está anexado ao `<div>` quando este efeito roda (React
        // sempre comita refs antes de disparar effects) — a asserção evita
        // simular em teste um branch que não acontece de verdade.
        const container = containerRef.current!;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const chunkX = Number(entry.target.getAttribute("data-chunk-x"));
                    const chunkY = Number(entry.target.getAttribute("data-chunk-y"));

                    if (entry.isIntersecting) {
                        onChunkEnter(chunkX, chunkY);
                    } else {
                        onChunkLeave(chunkX, chunkY);
                    }
                });
            },
            { root: container, rootMargin: PREFETCH_MARGIN },
        );

        placeholderRefs.current.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [chunkCoords, onChunkEnter, onChunkLeave]);

    // Rolagem por clique-e-arraste, como num app de mapas — a barra de
    // rolagem nativa fica escondida (`no-scrollbar`) e `touch-none` desliga
    // o pan por toque nativo do navegador, pra não competir com o
    // `scrollLeft`/`scrollTop` que este handler seta na mão. Pointer events
    // cobrem mouse e touch com o mesmo código.
    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        const container = containerRef.current;
        if (!container || event.button !== 0) {
            return;
        }

        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollLeft: container.scrollLeft,
            startScrollTop: container.scrollTop,
            dragged: false,
        };
        container.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        const container = containerRef.current;
        if (!drag || !container || drag.pointerId !== event.pointerId) {
            return;
        }

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        if (!drag.dragged) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
                return;
            }
            drag.dragged = true;
            container.classList.remove("cursor-grab");
            container.classList.add("cursor-grabbing");
        }

        container.scrollLeft = drag.startScrollLeft - dx;
        container.scrollTop = drag.startScrollTop - dy;
    }

    function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        const container = containerRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        // `wasDragged` sobrevive pro `handleClickCapture` (que roda a
        // seguir, no `click` que o navegador dispara depois do
        // pointerup) — mas `dragRef.current` em si precisa ser limpo já
        // aqui: o `pointerId` do mouse não muda entre gestos (ao
        // contrário do touch, que gera um novo por toque), então sem
        // isso um `pointermove` de simplesmente passar o cursor sobre o
        // mapa (sem o botão pressionado) bate o mesmo `pointerId` do
        // arrasto anterior e é lido como sua continuação — o mapa
        // continua "arrastando" sozinho depois que o mouse já soltou.
        wasDraggedRef.current = drag.dragged;
        dragRef.current = null;

        container?.releasePointerCapture?.(event.pointerId);
        container?.classList.remove("cursor-grabbing");
        container?.classList.add("cursor-grab");
    }

    // Impede que o clique disparado pelo navegador logo após um arrasto
    // (pointerup -> click, mesmo destino) chegue ao `onClick` do tile.
    function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
        if (wasDraggedRef.current) {
            wasDraggedRef.current = false;
            event.stopPropagation();
        }
    }

    return (
        <div
            ref={containerRef}
            className="iso-grid scroll-auto no-scrollbar touch-none cursor-grab h-full w-full"
            // `--color`, não `backgroundColor` direto — é assim que `Block`
            // (packages/luv-ui) já recebe cor pra poder escurecer com
            // `--sun-y` via `color-mix()` (ver IsoGrid.scss); `backgroundColor`
            // ignoraria a posição do sol e ficaria com um verde fixo, sem
            // acompanhar o mesmo ciclo dia/noite dos tiles.
            style={{ "--color": backgroundColor } as CSSProperties}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={handleClickCapture}
        >
            <div
                className="iso-inner"
                style={{
                    // `offsetX` sozinho já traz o tile mais à esquerda (que
                    // tem `left: minX`, negativo) pra x=0 dentro da área de
                    // scroll. Dobrar esse valor (bug antigo, copiado de
                    // IsoGrid#getIsoBounds) empurra o conteúdo `offsetX`
                    // pixels a mais pra direita, sobrando um vão vazio do
                    // mesmo tamanho nas duas pontas — visível como um espaço
                    // enorme em volta do mapa antes de rolar até ele.
                    marginLeft: `${bounds.offsetX}px`,
                    marginTop: `${bounds.offsetY}px`,
                    width: bounds.width,
                    height: bounds.height,
                    position: "relative",
                }}
            >
                {chunkCoords.map(({ chunkX, chunkY }) => {
                    const box = getChunkPixelBox(chunkX, chunkY, dimensions.width, dimensions.height, tileSize);
                    const key = `${chunkX}:${chunkY}`;

                    return (
                        <div
                            key={key}
                            ref={(element) => {
                                if (element) {
                                    placeholderRefs.current.set(key, element);
                                } else {
                                    placeholderRefs.current.delete(key);
                                }
                            }}
                            data-chunk-x={chunkX}
                            data-chunk-y={chunkY}
                            style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height }}
                        />
                    );
                })}

                {tiles.map((tile) => {
                    const clickable = Boolean(onTileClick) && (!isTileClickable || isTileClickable(tile));

                    return (
                        <Block
                            key={`${tile.x}:${tile.y}`}
                            {...tile}
                            size={tileSize}
                            color={TILE_TYPES[tile.type as keyof typeof TILE_TYPES]?.color}
                            texture={TILE_TYPES[tile.type as keyof typeof TILE_TYPES]?.texture}
                            onClick={clickable ? () => onTileClick!(tile) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
}
