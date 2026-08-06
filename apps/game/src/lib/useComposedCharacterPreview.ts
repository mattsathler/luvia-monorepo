import { useEffect, useState } from "react";
import { composeAndTrimLayers } from "./image-trim";

/**
 * Prévia ao vivo do personagem: empilha as camadas (body/face/roupa, nessa
 * ordem) num canvas e recorta a blank area do conjunto — ver
 * `composeAndTrimLayers` e docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * `null` enquanto a primeira composição não termina.
 */
export function useComposedCharacterPreview(layers: string[]): string | null {
    const [composed, setComposed] = useState<string | null>(null);
    const layersKey = layers.join("|");

    useEffect(() => {
        let cancelled = false;

        composeAndTrimLayers(layers)
            .then((result) => {
                if (!cancelled) {
                    setComposed(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setComposed(null);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- layersKey is the stable identity for the layers array.
    }, [layersKey]);

    return composed;
}
