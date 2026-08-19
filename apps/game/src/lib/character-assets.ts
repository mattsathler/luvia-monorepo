export type LayerAsset = {
    id: string;
    src: string;
    /**
     * Miniatura pro seletor (ThumbnailOption) — pré-recortada (sem blank
     * area) ou, para o slot "remover peça" de uma categoria opcional (ex.:
     * cabelo careca, sem sapato, sem casaco), um X no lugar do PNG em
     * branco que `src` aponta.
     */
    previewSrc: string;
};

/**
 * Catálogo de peças de personagem, montado a partir de assets/character —
 * ver docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * Cada pasta (`body_types`, `faces`, `pants`, `shoes`, `tops`, ...) é uma
 * categoria; dentro dela, cada subpasta `<id>/` é uma opção, com dois
 * arquivos: `<id>_model.png` (a peça em si, composta no Player — ver
 * `Player.tsx`) e `<id>_preview.png` (a miniatura mostrada no seletor — ver
 * `ThumbnailOption`). O id é só o número da subpasta — não tem nome, não é
 * mostrado ao jogador. Soltar uma pasta `<id>/` nova com os dois PNGs na
 * categoria certa já disponibiliza a opção, sem editar código.
 */
const modules = import.meta.glob<{ default: string }>("../assets/character/*/*/*.png", { eager: true });

type CatalogEntry = { id: string; src?: string; previewSrc?: string };

const byCategory: Record<string, Record<string, CatalogEntry>> = {};

// Assume que todo arquivo em assets/character/<categoria>/<id>/ segue a
// convenção de nome (`<id>_model.png` ou `<id>_preview.png`, só dígitos no
// id) — um arquivo fora da convenção quebra o build aqui, o que é
// preferível a ignorá-lo silenciosamente.
for (const path in modules) {
    const match = path.match(/character\/([^/]+)\/(\d+)\/(\d+)_(model|preview)\.png$/)!;
    const [, category, folderId, fileId, kind] = match;

    if (folderId !== fileId) {
        throw new Error(`Character asset id mismatch: ${path} (pasta "${folderId}" vs arquivo "${fileId}")`);
    }

    const entries = (byCategory[category] ??= {});
    const entry = (entries[folderId] ??= { id: folderId });

    if (kind === "preview") {
        entry.previewSrc = modules[path].default;
    } else {
        entry.src = modules[path].default;
    }
}

const CATALOG: Record<string, LayerAsset[]> = {};

for (const [category, entries] of Object.entries(byCategory)) {
    CATALOG[category] = Object.values(entries)
        .map((entry) => {
            if (!entry.src) {
                throw new Error(`Character asset sem <id>_model.png: ${category}/${entry.id}`);
            }

            // Sem preview dedicado, cai pra própria peça — coerente com o que
            // já é sempre verdade pras categorias que não têm slot "remover".
            return { id: entry.id, src: entry.src, previewSrc: entry.previewSrc ?? entry.src };
        })
        .sort((a, b) => Number(a.id) - Number(b.id));
}

/** Opções disponíveis para uma categoria — lista vazia se a pasta ainda não existir. */
export function getLayerAssets(category: string): LayerAsset[] {
    return CATALOG[category] ?? [];
}

/** Resolve o PNG (peça, não miniatura) de um id específico dentro de uma categoria, se existir. */
export function getLayerSrc(category: string, id: string): string | undefined {
    return CATALOG[category]?.find((asset) => asset.id === id)?.src;
}
