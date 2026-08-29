import { useEffect, useState } from "react";
import type { TileData } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import { getCity, getCurrentLot, type Character, type City, type CurrentLot, type Lot } from "../../lib/api";
import { getStoredTileSize, setStoredTileSize } from "./city-zoom-storage";
import type { LotSelection } from "./LotDetailModal.controller";

export type { CurrentLot } from "../../lib/api";

/**
 * Tamanho do tile é uma otimização (ver docs/technical/lowys-carregamento-em-chunks.md):
 * tile maior = menos tiles cabem na tela = menos DOM montado por vez. O ajuste
 * (zoom) fica implementado aqui e persiste entre sessões (ver
 * city-zoom-storage.ts), mas sem UI própria por enquanto — a exposição pro
 * jogador fica pra um futuro menu de configurações (ver
 * docs/ui-ux/settings-menu.md).
 */
export const MIN_TILE_SIZE = 200;
export const MAX_TILE_SIZE = 640;
export const DEFAULT_TILE_SIZE = 240;
export const ZOOM_STEP = 40;

function clampTileSize(size: number): number {
    return Math.min(MAX_TILE_SIZE, Math.max(MIN_TILE_SIZE, size));
}

// Só lotes são inspecionáveis — "grass" (ainda sem dono), "lot" e "lot-mine"
// (ver buildChunkTiles em CityGrid.controller.ts). Rua, água e prédios
// públicos (landmark) não são lotes (ver docs/game-design/lots-and-construction.md)
// e não abrem o modal de inspeção.
export function isTileClickable(tile: TileData): boolean {
    return tile.type === "grass" || tile.type === "lot" || tile.type === "lot-mine";
}

type UseHomePageControllerParams = {
    character: Character;
};

export function useHomePageController({ character }: UseHomePageControllerParams) {
    const { accessToken } = useAuth();
    const [dimensions, setDimensions] = useState<City | null>(null);
    const [currentLot, setCurrentLot] = useState<CurrentLot | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [tileSize, setTileSize] = useState(() => clampTileSize(getStoredTileSize() ?? DEFAULT_TILE_SIZE));
    const [selectedLot, setSelectedLot] = useState<LotSelection | null>(null);
    const [dragModeEnabled, setDragModeEnabled] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        // getCurrentLot resolve, no backend, o lote onde o personagem está
        // agora (casa, trabalho, evento — ver GetCurrentLotUseCase na API) a
        // partir da atividade atual, e de quebra garante que o personagem já
        // tem um lote residencial (reivindicando um automaticamente na
        // primeira vez) antes de saber o tamanho da cidade — o terreno em si
        // (ver LOWYS, docs/technical/lowys-carregamento-em-chunks.md) é
        // buscado por chunk sob demanda, não aqui. Alimenta o CalendarPanel.
        getCurrentLot(accessToken, character.id)
            .then((lot) => {
                setCurrentLot(lot);
                return getCity(accessToken);
            })
            .then(setDimensions)
            .catch(() => setLoadError("Não foi possível carregar a cidade. Tente novamente."));
    }, [accessToken, character.id]);

    // Todo lote é inspecionável, com ou sem dono/construção (ver regra I do
    // pedido de inspeção de lote) — `isTileClickable` já garante que só
    // tiles de lote chegam aqui; `lot` vem `undefined` pra um tile ainda sem
    // `Lot` reivindicado.
    function handleTileClick(tile: TileData, lot?: Lot) {
        setSelectedLot({ x: tile.x, y: tile.y, lot: lot ?? null });
    }

    function closeLotModal() {
        setSelectedLot(null);
    }

    function zoomIn() {
        setTileSize((current) => {
            const next = clampTileSize(current + ZOOM_STEP);
            setStoredTileSize(next);
            return next;
        });
    }

    function zoomOut() {
        setTileSize((current) => {
            const next = clampTileSize(current - ZOOM_STEP);
            setStoredTileSize(next);
            return next;
        });
    }

    return {
        dimensions,
        currentLot,
        loadError,
        handleTileClick,
        selectedLot,
        closeLotModal,
        accessToken,
        tileSize,
        zoomIn,
        zoomOut,
        canZoomIn: tileSize < MAX_TILE_SIZE,
        canZoomOut: tileSize > MIN_TILE_SIZE,
        dragModeEnabled,
        setDragModeEnabled,
    };
}
