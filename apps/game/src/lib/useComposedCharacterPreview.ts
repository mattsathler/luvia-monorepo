import { useEffect, useState } from "react";
import { composeAndTrimLayers, type CanvasRegion } from "./image-trim";

/**
 * Prévia ao vivo do personagem: empilha as camadas (body/face/roupa, nessa
 * ordem) num canvas e recorta a blank area do conjunto (ou de uma região
 * fixa dela, via `region` — ver `CanvasRegion`) — ver `composeAndTrimLayers`
 * e docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * `null` enquanto a primeira composição não termina.
 */
export function useComposedCharacterPreview(layers: string[], region?: CanvasRegion): string | null {
    const [composed, setComposed] = useState<string | null>(null);
    const layersKey = layers.join("|");
    const regionKey = region ? `${region.minXFrac}|${region.minYFrac}|${region.maxXFrac}|${region.maxYFrac}` : "";

    useEffect(() => {
        let cancelled = false;

        composeAndTrimLayers(layers, region)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- layersKey/regionKey are the stable identities for layers/region.
    }, [layersKey, regionKey]);

    return composed;
}
