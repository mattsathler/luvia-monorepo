import { useComposedCharacterPreview } from "../../lib/useComposedCharacterPreview";
import { getLayerSrc } from "../../lib/character-assets";

/**
 * Ordem de empilhamento (de baixo pra cima) das categorias de
 * assets/character — ver docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md
 * item 3. Cabelo fica na frente do rosto; a blusa (`tops`) sempre fica por
 * baixo da calça (`pants`); `overlays` (jaqueta/casaco) é sempre a última
 * camada, cobrindo tudo. `eye_types` ainda não entrou no empilhamento — sem
 * PNG real (ver Pendências no doc).
 */
export const LAYER_ORDER = ["body_types", "faces", "hair_types", "tops", "pants", "shoes", "overlays"] as const;
export type LayerCategory = (typeof LAYER_ORDER)[number];
export type PlayerLayers = Partial<Record<LayerCategory, string>>;

type PlayerProps = {
    layers: PlayerLayers;
};

/**
 * Monta e mostra um personagem a partir dos ids de cada camada (ex.:
 * `{ body_types: "3", faces: "0", hair_types: "0", tops: "0", pants: "0", shoes: "0", overlays: "0" }`) —
 * objeto reutilizável
 * tanto para a prévia ao vivo da criação de personagem quanto para exibir os
 * detalhes de um jogador específico em qualquer outro lugar do jogo.
 */
export function Player({ layers }: PlayerProps) {
    const sources = LAYER_ORDER.flatMap((category) => {
        const id = layers[category];
        if (id === undefined) {
            return [];
        }

        const src = getLayerSrc(category, id);
        return src ? [src] : [];
    });

    const composed = useComposedCharacterPreview(sources);

    return composed ? (
        <img src={composed} alt="Personagem" className="w-auto h-auto h-full margin-center animate-breathe" />
    ) : (
        <p className="text-text">Montando personagem...</p>
    );
}
