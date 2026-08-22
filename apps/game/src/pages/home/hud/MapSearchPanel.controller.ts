import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { searchLots, type Character, type LotSearchResult } from "../../../lib/api";

const DEBOUNCE_MS = 250;

/**
 * Busca de lotes da HUD (ícone de mapa, canto inferior esquerdo) — ponto de
 * navegação rápida do jogador (ver docs/game-design). Debounce simples pra
 * não disparar uma requisição por tecla; `query` vazio já dispara (devolve a
 * cidade inteira, sem filtro — ver SearchLotsUseCase na API).
 *
 * A distância (em blocos) até a casa do jogador e a ordenação por
 * proximidade já vêm prontas do backend (`characterId` na busca) — ver
 * `searchLots` em lib/api.ts.
 */
export function useMapSearchPanelController(character: Character) {
    const { accessToken } = useAuth();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<LotSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        setIsLoading(true);
        const timeout = setTimeout(() => {
            searchLots(accessToken, query, character.id)
                .then(setResults)
                .catch(() => setResults([]))
                .finally(() => setIsLoading(false));
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [accessToken, query, character.id]);

    // Navegar até o lote (centralizar o mapa nele) depende do sistema de
    // pan/zoom pela cidade toda, ainda pendente (ver
    // docs/roadmap/03-cidade-e-lar/planos/06-interacao-com-a-metropole.md) —
    // o clique já fica plugado, só loga por enquanto.
    function handleSelectLot(lot: LotSearchResult) {
        // eslint-disable-next-line no-console
        console.log("Navegar até o lote:", lot);
    }

    return { query, setQuery, results, isLoading, handleSelectLot };
}
