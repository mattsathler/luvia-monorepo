import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Block, TILE_TYPES } from "luv-ui";
import type { TileData } from "luv-ui";
import type { Lot } from "../../lib/api";
import { CHUNK_SIZE, useCityGridController } from "./CityGrid.controller";

/** ~1 chunk de buffer em todas as direções — ver docs/technical/lowys-carregamento-em-chunks.md. */
const PREFETCH_MARGIN = "640px";

type DragState = {
    pointerId: number;
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
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

/** Mesma fórmula de `getChunkPixelBox`, pra um único tile em vez de um chunk inteiro — usado pra centralizar a rolagem num lote (ver `useEffect` de `targetLot`). */
function getTilePixelBox(x: number, y: number, size: number) {
    const { minX, minY } = isoCornersBoundingBox([{ x, y }], size);
    return { left: minX, top: minY, width: size, height: size };
}

type CityGridProps = {
    dimensions: { width: number; height: number };
    tileSize: number;
    /** Hex, vem do doc da cidade (ver apps/api CityMap#backgroundColor) — não fixo aqui, pra permitir biomas diferentes no futuro. */
    backgroundColor: string;
    accessToken: string;
    characterId: string;
    onTileClick?: (tile: TileData, lot?: Lot) => void;
    isTileClickable?: (tile: TileData) => boolean;
    /** Lote pra centralizar a rolagem assim que definido/trocado (ex.: clique num resultado do MapSearchPanel, ou `?x=&y=` na URL) — `null`/omitido não move o mapa. */
    targetLot?: { x: number; y: number } | null;
    /**
     * Modo explícito, ligado/desligado pelo botão de arrasto no HUD (ver
     * CalendarPanel/HomeHud) — em vez de tentar adivinhar arrasto vs. clique
     * por distância percorrida, o próprio jogador escolhe. Ligado: o
     * ponteiro arrasta o mapa e nenhum clique chega aos tiles. Desligado:
     * clique normal nos tiles, sem arrasto por ponteiro (rolagem por
     * scrollbar/trackpad/touch nativo continua disponível via `scroll-auto`).
     */
    dragModeEnabled: boolean;
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
    targetLot,
    dragModeEnabled,
}: CityGridProps) {
    const { chunkCoords, tiles, onChunkEnter, onChunkLeave, isChunkLoaded, loadChunk, getLotAt } = useCityGridController({
        dimensions,
        accessToken,
        characterId,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const placeholderRefs = useRef(new Map<string, HTMLDivElement>());
    const dragRef = useRef<DragState | null>(null);
    /** Evita renavegar pro mesmo lote a cada re-render (ex.: zoom) — só o *lote* muda o alvo, não o tamanho do tile. */
    const lastTargetKeyRef = useRef<string | null>(null);

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
        // Navega até `targetLot` (clique num resultado do MapSearchPanel, ou
        // `?x=&y=` na URL ao abrir um link compartilhado) — uma vez por lote
        // (`lastTargetKeyRef`), não a cada re-render (ex.: zoom mudando
        // `tileSize`, que também está nas deps pra recalcular a posição caso
        // o efeito rode antes do zoom estabilizar).
        if (!targetLot) {
            return;
        }

        const container = containerRef.current;
        if (!container) {
            return;
        }

        const targetKey = `${targetLot.x}:${targetLot.y}`;
        if (lastTargetKeyRef.current === targetKey) {
            return;
        }
        lastTargetKeyRef.current = targetKey;

        const chunkX = Math.floor(targetLot.x / CHUNK_SIZE);
        const chunkY = Math.floor(targetLot.y / CHUNK_SIZE);
        const wasAlreadyLoaded = isChunkLoaded(chunkX, chunkY);

        function scrollToTarget() {
            const box = getTilePixelBox(targetLot!.x, targetLot!.y, tileSize);
            const left = Math.max(0, bounds.offsetX + box.left + box.width / 2 - container!.clientWidth / 2);
            const top = Math.max(0, bounds.offsetY + box.top + box.height / 2 - container!.clientHeight / 2);
            // Chunk já carregado (lote próximo/já visitado): anima a
            // rolagem, é rápido e dá pro jogador acompanhar o trajeto no
            // mapa. Chunk novo (precisou do endpoint): pula direto — animar
            // uma rolagem longa sobre território ainda vazio só atrasa sem
            // ajudar, e a própria busca já introduz uma pausa perceptível.
            container!.scrollTo({ left, top, behavior: wasAlreadyLoaded ? "smooth" : "auto" });
        }

        if (wasAlreadyLoaded) {
            onChunkEnter(chunkX, chunkY);
            scrollToTarget();
        } else {
            loadChunk(chunkX, chunkY).then(() => {
                onChunkEnter(chunkX, chunkY);
                scrollToTarget();
            });
        }
    }, [targetLot, tileSize, bounds.offsetX, bounds.offsetY, isChunkLoaded, loadChunk, onChunkEnter]);

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

    // Rolagem por clique-e-arraste, como num app de mapas — só ativa quando
    // `dragModeEnabled` (botão de arrasto no HUD, ver CalendarPanel/HomeHud).
    // Tentar adivinhar arrasto vs. clique por distância percorrida (versão
    // anterior) não dava pra confiar: no Safari/macOS, chamar
    // `setPointerCapture` no mesmo ciclo pointerdown->pointerup de um clique
    // parado (mesmo sem nenhum movimento) fazia o navegador nunca sintetizar
    // o `click` nativo depois — o clique simplesmente não chegava no
    // `onClick` do `Block`. Com o modo explícito, cada gesto já nasce sabendo
    // se é arrasto (captura o ponteiro e ignora cliques) ou clique comum (não
    // mexe em pointer capture, então o `click` do navegador nunca é afetado).
    function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
        const container = containerRef.current;
        if (!container || event.button !== 0 || !dragModeEnabled) {
            return;
        }

        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startScrollLeft: container.scrollLeft,
            startScrollTop: container.scrollTop,
        };
        container.classList.remove("cursor-grab");
        container.classList.add("cursor-grabbing");
        container.setPointerCapture?.(event.pointerId);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        const container = containerRef.current;
        if (!drag || !container || drag.pointerId !== event.pointerId) {
            return;
        }

        container.scrollLeft = drag.startScrollLeft - (event.clientX - drag.startX);
        container.scrollTop = drag.startScrollTop - (event.clientY - drag.startY);
    }

    function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
        const drag = dragRef.current;
        const container = containerRef.current;
        if (!drag || drag.pointerId !== event.pointerId) {
            return;
        }

        dragRef.current = null;

        container?.releasePointerCapture?.(event.pointerId);
        container?.classList.remove("cursor-grabbing");
        if (dragModeEnabled) {
            container?.classList.add("cursor-grab");
        }
    }

    // Enquanto o modo de arrasto tá ligado, nenhum clique chega aos tiles —
    // é assim que o jogador arrasta o mapa sem abrir o modal de um lote por
    // baixo do ponteiro.
    function handleClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
        if (dragModeEnabled) {
            event.stopPropagation();
        }
    }

    return (
        <div
            ref={containerRef}
            // `touch-none`/`cursor-grab` só com o modo de arrasto ligado —
            // desligado, o toque nativo (scroll por swipe) e o cursor padrão
            // do navegador seguem valendo, sem o pointer-drag deste componente
            // competindo com eles.
            className={`iso-grid scroll-auto no-scrollbar h-full w-full ${dragModeEnabled ? "touch-none cursor-grab" : ""}`}
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
                            onClick={clickable ? () => onTileClick!(tile, getLotAt(tile.x, tile.y)) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
}
