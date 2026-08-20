import { useEffect, useMemo, useState } from "react";
import type { TileData } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import { getCharacterLot, getCity, type Character, type City } from "../../lib/api";

export const CITY_TILE_SIZE = 64;

export function buildCityTiles(city: City, characterId: string): TileData[] {
    const lotsByPosition = new Map(city.lots.map((lot) => [`${lot.x}:${lot.y}`, lot]));

    return city.tiles.map((tile) => {
        const lot = lotsByPosition.get(`${tile.x}:${tile.y}`);
        const type = !lot ? tile.type : lot.characterId === characterId ? "lot-mine" : "lot";
        return { x: tile.x, y: tile.y, z: 0, type };
    });
}

type UseHomePageControllerParams = {
    character: Character;
};

export function useHomePageController({ character }: UseHomePageControllerParams) {
    const { logout, accessToken } = useAuth();
    const [city, setCity] = useState<City | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        // Garante que o personagem já tem um lote residencial (reivindicando
        // um automaticamente na primeira vez) antes de listar a cidade inteira.
        getCharacterLot(accessToken, character.id)
            .then(() => getCity(accessToken))
            .then(setCity)
            .catch(() => setLoadError("Não foi possível carregar a cidade. Tente novamente."));
    }, [accessToken, character.id]);

    const tiles = useMemo(() => (city ? buildCityTiles(city, character.id) : null), [city, character.id]);

    return { logout, tiles, loadError };
}
