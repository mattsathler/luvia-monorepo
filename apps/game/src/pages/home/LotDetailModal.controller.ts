import { useEffect, useMemo, useState } from "react";
import {
    getCharacter,
    getLotNeighborhood,
    type Character,
    type Lot,
    type LotType,
    type NeighborhoodEntry,
} from "../../lib/api";
import { pickRandomLotInspectionTip } from "./lotInspectionTips";

// Só existe lote residencial hoje — quando lotes comerciais/industriais
// existirem (ver docs/game-design/lots-and-construction.md), este mapa
// ganha as novas entradas, espelhando LOT_TYPE_NAMES na API
// (apps/api/src/city/domain/entities/lot.entity.ts).
export const LOT_TYPE_LABELS: Record<LotType, string> = {
    residential: "Residencial",
};

// `Workplace.buildingTypeId` é uma chave opaca pro catálogo de prédios do
// bounded context `employment` (ver apps/api/.../workplace.entity.ts) — o
// nome amigável é resolvido aqui, no frontend, em vez de `city` importar o
// catálogo de `employment` (mesma convenção de LOT_TYPE_LABELS acima
// espelhando LOT_TYPE_NAMES; ver também BUILDING_CATALOG na API).
export const BUILDING_TYPE_LABELS: Record<string, string> = {
    "city-hall": "Prefeitura",
    hospital: "Hospital Municipal",
    "police-station": "Delegacia de Polícia",
    "civil-guard": "Guarda Municipal",
    "public-works-department": "Secretaria de Obras Públicas",
    "metal-workshop": "Oficina Municipal de Metalurgia",
    "treasury-department": "Secretaria da Fazenda",
    "municipal-school": "Escola Municipal",
};

export type LotSelection = {
    x: number;
    y: number;
    /** `null` quando o tile ainda não tem um `Lot` reivindicado — inspecionável do mesmo jeito (ver regra I). */
    lot: Lot | null;
};

export type NeighborhoodItem = {
    id: string;
    label: string;
    distanceMinutes: number;
    icon: string;
};

// Placeholder de exibição — 1 bloco da grade ≈ 1 minuto a pé. Sem ligação
// com nenhuma mecânica de jogo (a distância que afeta eficiência de trabalho
// usa blocos crus, ver apps/api/.../employment/domain/entities/efficiency.ts).
const WALK_MINUTES_PER_BLOCK = 1;

function toNeighborhoodItem(entry: NeighborhoodEntry): NeighborhoodItem {
    if (entry.kind === "workplace") {
        return {
            id: entry.id,
            label: entry.buildingTypeId ? (BUILDING_TYPE_LABELS[entry.buildingTypeId] ?? entry.buildingTypeId) : "Prédio",
            distanceMinutes: Math.max(1, Math.round(entry.distanceBlocks * WALK_MINUTES_PER_BLOCK)),
            icon: "work",
        };
    }

    return {
        id: entry.id,
        label: `${entry.typeName ?? "Lote"} de ${entry.ownerName ?? "Prefeitura"}`,
        distanceMinutes: Math.max(1, Math.round(entry.distanceBlocks * WALK_MINUTES_PER_BLOCK)),
        icon: "home",
    };
}

type UseLotDetailModalControllerParams = {
    selection: LotSelection | null;
    accessToken: string;
    currentCharacter: Character;
};

export function useLotDetailModalController({ selection, accessToken, currentCharacter }: UseLotDetailModalControllerParams) {
    const lot = selection?.lot ?? null;

    const [owner, setOwner] = useState<Character | null>(null);
    const [isLoadingOwner, setIsLoadingOwner] = useState(false);
    const [neighborhood, setNeighborhood] = useState<NeighborhoodItem[]>([]);
    const [isLoadingNeighborhood, setIsLoadingNeighborhood] = useState(false);

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

    useEffect(() => {
        if (!selection) {
            setNeighborhood([]);
            return;
        }

        let cancelled = false;
        setIsLoadingNeighborhood(true);

        getLotNeighborhood(accessToken, selection.x, selection.y, lot?.id)
            .then((entries) => {
                if (!cancelled) {
                    setNeighborhood(entries.map(toNeighborhoodItem));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setNeighborhood([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingNeighborhood(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selection?.x, selection?.y, lot?.id, accessToken]);

    // Uma dica nova a cada lote inspecionado, não a cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const tip = useMemo(() => pickRandomLotInspectionTip(), [selection?.x, selection?.y]);

    const isOwnLot = lot?.characterId === currentCharacter.id;
    const ownerName = !lot
        ? "Disponível"
        : isOwnLot
          ? `${currentCharacter.firstName} ${currentCharacter.lastName}`
          : owner
            ? `${owner.firstName} ${owner.lastName}`
            : "Prefeitura";

    return {
        x: selection?.x ?? 0,
        y: selection?.y ?? 0,
        // `undefined` sem lote ainda — "tipo (se houver)" (ver regra II).
        typeLabel: lot ? LOT_TYPE_LABELS[lot.type] : undefined,
        ownerName,
        isOwnLot,
        // Só relevante quando `!isOwnLot` — o dono do próprio lote já é
        // conhecido sem consulta (ver useEffect acima).
        isLoadingOwner,
        neighborhood,
        isLoadingNeighborhood,
        tip,
    };
}
