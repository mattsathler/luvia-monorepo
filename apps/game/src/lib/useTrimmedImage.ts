import { useEffect, useState } from "react";
import { trimTransparentPadding } from "./image-trim";

/**
 * Miniatura recortada (ver trimTransparentPadding) de uma peça de personagem.
 * Enquanto corta, devolve a imagem original sem corte — a miniatura só troca
 * para a versão recortada quando o processamento termina, sem piscar vazio.
 */
export function useTrimmedImage(src: string, enabled = true): string {
    const [trimmed, setTrimmed] = useState(src);

    useEffect(() => {
        let cancelled = false;
        setTrimmed(src);

        if (!enabled) {
            return;
        }

        trimTransparentPadding(src)
            .then((result) => {
                if (!cancelled) {
                    setTrimmed(result);
                }
            })
            .catch(() => {
                // Falha ao carregar/recortar (ex.: rede) — mantém a imagem original.
            });

        return () => {
            cancelled = true;
        };
    }, [src, enabled]);

    return trimmed;
}
