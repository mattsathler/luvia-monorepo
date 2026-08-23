import { useEffect, useState } from "react";
import { getCharacter, type Character, type Lot, type LotType } from "../../lib/api";

// Só existe lote residencial hoje — quando lotes comerciais/industriais
// existirem (ver docs/game-design/lots-and-construction.md), este mapa
// ganha as novas entradas, espelhando LOT_TYPE_NAMES na API
// (apps/api/src/city/domain/entities/lot.entity.ts).
export const LOT_TYPE_LABELS: Record<LotType, string> = {
    residential: "Residencial",
};

type UseLotDetailModalControllerParams = {
    lot: Lot | null;
    accessToken: string;
    currentCharacter: Character;
};

export function useLotDetailModalController({ lot, accessToken, currentCharacter }: UseLotDetailModalControllerParams) {
    const [owner, setOwner] = useState<Character | null>(null);
    const [isLoadingOwner, setIsLoadingOwner] = useState(false);

    useEffect(() => {
        if (!lot || lot.characterId === currentCharacter.id) {
            setOwner(null);
            return;
        }

        let cancelled = false;
        setIsLoadingOwner(true);

        getCharacter(accessToken, lot.characterId)
            .then((character) => {
                if (!cancelled) {
                    setOwner(character);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setOwner(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingOwner(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [lot, accessToken, currentCharacter.id]);

    const isOwnLot = lot?.characterId === currentCharacter.id;
    const ownerName = isOwnLot
        ? `${currentCharacter.firstName} ${currentCharacter.lastName}`
        : owner
          ? `${owner.firstName} ${owner.lastName}`
          : "Prefeitura";

    return {
        typeLabel: lot ? LOT_TYPE_LABELS[lot.type] : "",
        ownerName,
        isOwnLot,
        // Só relevante quando `!isOwnLot` — o dono do próprio lote já é
        // conhecido sem consulta (ver useEffect acima).
        isLoadingOwner,
    };
}
