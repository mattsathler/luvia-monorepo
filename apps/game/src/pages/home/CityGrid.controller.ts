import { useCallback, useMemo, useRef, useState } from "react";
import type { TileData } from "luv-ui";
import { getCityChunk, type CityChunk } from "../../lib/api";

/**
 * Ver docs/technical/lowys-carregamento-em-chunks.md — LOWYS (Load Only What
 * You See). Mesmo valor de apps/api/src/city/domain/entities/chunk.ts;
 * mantido em sincronia manualmente (mesmo padrão já usado pra `TerrainType`,
 * duplicado entre backend e apps/game/src/lib/api.ts).
 */
export const CHUNK_SIZE = 10;

export type ChunkCoordinate = { chunkX: number; chunkY: number };

export function buildChunkTiles(chunk: CityChunk, characterId: string): TileData[] {
    const lotsByPosition = new Map(chunk.lots.map((lot) => [`${lot.x}:${lot.y}`, lot]));

    return chunk.tiles.map((tile) => {
        const lot = lotsByPosition.get(`${tile.x}:${tile.y}`);
        const type = !lot ? tile.type : lot.characterId === characterId ? "lot-mine" : "lot";
        return { x: tile.x, y: tile.y, z: 0, type };
    });
}

function chunkKey(chunkX: number, chunkY: number): string {
    return `${chunkX}:${chunkY}`;
}

type UseCityGridControllerParams = {
    dimensions: { width: number; height: number };
    accessToken: string;
    characterId: string;
};

export function useCityGridController({ dimensions, accessToken, characterId }: UseCityGridControllerParams) {
    // Cache que nunca expira dentro da sessão — sair da janela de render não
    // esquece o chunk, só tira o DOM dele.
    const cacheRef = useRef(new Map<string, TileData[]>());
    const [mountedKeys, setMountedKeys] = useState<Set<string>>(new Set());
    // O cache vive num ref (não dispara re-render sozinho) — este contador
    // força um re-render depois que um fetch resolve e escreve nele.
    const [version, setVersion] = useState(0);

    const chunkCoords = useMemo<ChunkCoordinate[]>(() => {
        const columns = Math.ceil(dimensions.width / CHUNK_SIZE);
        const rows = Math.ceil(dimensions.height / CHUNK_SIZE);
        const coords: ChunkCoordinate[] = [];

        for (let chunkY = 0; chunkY < rows; chunkY++) {
            for (let chunkX = 0; chunkX < columns; chunkX++) {
                coords.push({ chunkX, chunkY });
            }
        }

        return coords;
    }, [dimensions.width, dimensions.height]);

    const loadChunk = useCallback(
        async (chunkX: number, chunkY: number) => {
            const key = chunkKey(chunkX, chunkY);
            if (cacheRef.current.has(key)) {
                return;
            }

            try {
                const chunk = await getCityChunk(accessToken, chunkX, chunkY);
                cacheRef.current.set(key, buildChunkTiles(chunk, characterId));
                setVersion((v) => v + 1);
            } catch {
                // Não cacheia nada — na próxima vez que o chunk entrar na
                // margem de interseção, a busca é repetida.
            }
        },
        [accessToken, characterId],
    );

    const onChunkEnter = useCallback(
        (chunkX: number, chunkY: number) => {
            const key = chunkKey(chunkX, chunkY);
            setMountedKeys((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
            void loadChunk(chunkX, chunkY);
        },
        [loadChunk],
    );

    const onChunkLeave = useCallback((chunkX: number, chunkY: number) => {
        const key = chunkKey(chunkX, chunkY);
        setMountedKeys((prev) => {
            if (!prev.has(key)) {
                return prev;
            }
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    }, []);

    const tiles = useMemo(() => {
        const result: TileData[] = [];
        mountedKeys.forEach((key) => {
            const cached = cacheRef.current.get(key);
            if (cached) {
                result.push(...cached);
            }
        });

        // Ordem de pintura isométrica (fundo pra frente): `mountedKeys` segue
        // a ordem em que os chunks entraram na tela ao rolar, não a posição
        // deles na grade — sem reordenar aqui, um chunk montado por último
        // (ex.: ao rolar de volta pra cima) desenha por cima de tiles que
        // deveriam ficar atrás dele, incluindo o "lot-mine" do jogador.
        // `x + y` cresce em direção à parte de baixo da tela (mesma fórmula
        // de `getGridIsoBounds`/`getChunkPixelBox` em CityGrid.tsx).
        result.sort((a, b) => a.x + a.y - (b.x + b.y));

        return result;
        // `version` não é usado no corpo, só força o recálculo quando o
        // cache (um ref) muda por fora do ciclo normal do React.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mountedKeys, version]);

    return { chunkCoords, tiles, onChunkEnter, onChunkLeave };
}
