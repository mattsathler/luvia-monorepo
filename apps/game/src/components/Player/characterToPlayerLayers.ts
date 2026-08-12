import type { Character } from "../../lib/api";
import type { PlayerLayers } from "./Player";

// `faces`/`pants`/`shoes`/`tops` ainda só têm uma opção (id "0") — sem
// seleção real ainda (guarda-roupa, ver Pendências em
// docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md).
// Ignora os valores placeholder ("default"/`null`) persistidos no
// personagem até existir escolha de verdade pra essas camadas.
const DEFAULT_FACE_ID = "0";
const DEFAULT_PANTS_ID = "0";
const DEFAULT_SHOES_ID = "0";
const DEFAULT_TOP_ID = "0";

/** Traduz a aparência persistida de um personagem pros ids que `Player` entende. */
export function characterToPlayerLayers(character: Character): PlayerLayers {
    return {
        body_types: String(character.appearance.skinTone),
        faces: DEFAULT_FACE_ID,
        pants: DEFAULT_PANTS_ID,
        shoes: DEFAULT_SHOES_ID,
        tops: DEFAULT_TOP_ID,
    };
}
