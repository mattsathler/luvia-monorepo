import { useEffect, useState } from "react";
import type { TileData } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import { getCharacterLot, getCity, type Character, type City } from "../../lib/api";
import { getStoredTileSize, setStoredTileSize } from "./city-zoom-storage";

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
export const DEFAULT_TILE_SIZE = 480;
export const ZOOM_STEP = 40;

function clampTileSize(size: number): number {
    return Math.min(MAX_TILE_SIZE, Math.max(MIN_TILE_SIZE, size));
}

// Rua é só passagem, não tem informação própria pra consultar.
export function isTileClickable(tile: TileData): boolean {
    return !tile.type.startsWith("road");
}

type UseHomePageControllerParams = {
    character: Character;
};

export function useHomePageController({ character }: UseHomePageControllerParams) {
    const { accessToken } = useAuth();
    const [dimensions, setDimensions] = useState<City | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [tileSize, setTileSize] = useState(() => clampTileSize(getStoredTileSize() ?? DEFAULT_TILE_SIZE));

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        // Garante que o personagem já tem um lote residencial (reivindicando
        // um automaticamente na primeira vez) antes de saber o tamanho da
        // cidade — o terreno em si (ver LOWYS, docs/technical/lowys-carregamento-em-chunks.md)
        // é buscado por chunk sob demanda, não aqui.
        getCharacterLot(accessToken, character.id)
            .then(() => getCity(accessToken))
            .then(setDimensions)
            .catch(() => setLoadError("Não foi possível carregar a cidade. Tente novamente."));
    }, [accessToken, character.id]);

    // Sem painel de informação ainda (vem numa próxima rodada de UI) — por
    // enquanto só loga o tile clicado, já deixando a interação plugada.
    function handleTileClick(tile: TileData) {
        // eslint-disable-next-line no-console
        console.log("Tile clicado:", tile);
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
        loadError,
        handleTileClick,
        accessToken,
        tileSize,
        zoomIn,
        zoomOut,
        canZoomIn: tileSize < MAX_TILE_SIZE,
        canZoomOut: tileSize > MIN_TILE_SIZE,
    };
}
