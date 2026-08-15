import type { Character } from "../../lib/api";
import type { PlayerLayers } from "./Player";

// Personagens criados antes do seletor de guarda-roupa existir carregam o
// placeholder `DEFAULT_APPEARANCE` (`'default'`, ver
// apps/api/src/character/domain/entities/appearance.ts) em
// `face`/`top`/`pants`/`shoes` — não é um id de asset válido, então cai pro
// mesmo id `"0"` usado como ponto de partida na criação.
const PLACEHOLDER_APPEARANCE_ID = "default";
const FALLBACK_LAYER_ID = "0";

function resolveLayerId(id: string): string {
    return id === PLACEHOLDER_APPEARANCE_ID ? FALLBACK_LAYER_ID : id;
}

/** Traduz a aparência persistida de um personagem pros ids que `Player` entende. */
export function characterToPlayerLayers(character: Character): PlayerLayers {
    return {
        body_types: String(character.appearance.skinTone),
        faces: resolveLayerId(character.appearance.face),
        pants: resolveLayerId(character.appearance.pants),
        shoes: resolveLayerId(character.appearance.shoes),
        tops: resolveLayerId(character.appearance.top),
    };
}
