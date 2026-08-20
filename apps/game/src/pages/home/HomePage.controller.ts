import { useEffect, useState } from "react";
import type { TileData } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import { getCharacterLot, getCity, type Character, type City } from "../../lib/api";

export const CITY_TILE_SIZE = 64;

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

    return { dimensions, loadError, handleTileClick, accessToken };
}
