import { useComposedCharacterPreview } from "../../lib/useComposedCharacterPreview";
import { getLayerSrc } from "../../lib/character-assets";
import type { CanvasRegion } from "../../lib/image-trim";

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

export type PlayerPart = "full" | "head";

// Recortes fixos do canvas do personagem (frações 0..1) — todo PNG de peça
// nasce ancorado no mesmo canvas fixo (ver
// docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md),
// então uma janela fixa em fração serve pra qualquer resolução de asset.
// `head` mede da franja do cabelo até logo abaixo do pescoço (medido nos
// PNGs atuais: cabeça ~14–50% da altura do canvas) e usa a largura toda pra
// não cortar cabelo largo nas laterais — o recorte final aperta pro
// conteúdo real de qualquer forma.
const PLAYER_PART_REGIONS: Record<PlayerPart, CanvasRegion | undefined> = {
    full: undefined,
    head: { minXFrac: 0, minYFrac: 0.08, maxXFrac: 1, maxYFrac: 0.53 },
};

type PlayerProps = {
    layers: PlayerLayers;
    /**
     * Qual parte do personagem mostrar. `"head"` corta só cabeça/pescoço —
     * pensado pra avatares pequenos (ex.: `ProfilePanel` na HUD). `"full"`
     * (padrão) mostra o corpo inteiro, pra telas de detalhe do jogador.
     * @default "full"
     */
    part?: PlayerPart;
};

/**
 * Monta e mostra um personagem a partir dos ids de cada camada (ex.:
 * `{ body_types: "3", faces: "0", hair_types: "0", tops: "0", pants: "0", shoes: "0", overlays: "0" }`) —
 * objeto reutilizável
 * tanto para a prévia ao vivo da criação de personagem quanto para exibir os
 * detalhes de um jogador específico em qualquer outro lugar do jogo.
 */
export function Player({ layers, part = "full" }: PlayerProps) {
    const sources = LAYER_ORDER.flatMap((category) => {
        const id = layers[category];
        if (id === undefined) {
            return [];
        }

        const src = getLayerSrc(category, id);
        return src ? [src] : [];
    });

    const composed = useComposedCharacterPreview(sources, PLAYER_PART_REGIONS[part]);

    return composed ? (
        <img src={composed} alt="Personagem" className="w-auto h-auto h-full margin-center animate-breathe" />
    ) : (
        <p className="text-text">Montando personagem...</p>
    );
}
