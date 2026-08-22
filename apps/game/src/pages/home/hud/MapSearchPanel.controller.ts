import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
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

    // Muda a URL pra `/play?lot=&x=&y=` — o próprio HomePage (via CityGrid)
    // reage a `x`/`y` mudando e centraliza o mapa no lote (ver App.tsx e
    // CityGrid.tsx#targetLot). `lot` (o id) não é usado na navegação em si,
    // só acompanha pra a URL fazer sentido e ser compartilhável por link.
    // `replace: true` — trocar de lote na busca não deveria empilhar
    // histórico, é uma troca de posição, não uma nova página.
    function handleSelectLot(lot: LotSearchResult) {
        navigate(`/play?lot=${lot.lotId}&x=${lot.x}&y=${lot.y}`, { replace: true });
    }

    return { query, setQuery, results, isLoading, handleSelectLot };
}
