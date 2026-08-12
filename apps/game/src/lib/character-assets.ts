export type LayerAsset = {
    id: string;
    src: string;
};

/**
 * Catálogo de peças de personagem, montado a partir de assets/character —
 * ver docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * Cada pasta (`body_types`, `faces`, `pants`, `shoes`, `tops`, ...) é uma categoria; cada
 * arquivo `<id>.png` dentro dela é uma opção. O id é só o número do arquivo
 * — não tem nome, não é mostrado ao jogador (ver `ThumbnailOption`). Soltar
 * um PNG novo na pasta certa já disponibiliza a opção, sem editar código.
 */
const modules = import.meta.glob<{ default: string }>("../assets/character/*/*.png", { eager: true });

const CATALOG: Record<string, LayerAsset[]> = {};

// Assume que todo arquivo em assets/character/<categoria>/ segue a
// convenção de nome (só dígitos, ver docs/decisions/0020-...) — um arquivo
// fora da convenção quebra o build aqui, o que é preferível a ignorá-lo
// silenciosamente.
for (const path in modules) {
    const [, category, id] = path.match(/character\/([^/]+)\/(\d+)\.png$/)!;
    (CATALOG[category] ??= []).push({ id, src: modules[path].default });
}

for (const assets of Object.values(CATALOG)) {
    assets.sort((a, b) => Number(a.id) - Number(b.id));
}

/** Opções disponíveis para uma categoria — lista vazia se a pasta ainda não existir. */
export function getLayerAssets(category: string): LayerAsset[] {
    return CATALOG[category] ?? [];
}

/** Resolve o PNG de um id específico dentro de uma categoria, se existir. */
export function getLayerSrc(category: string, id: string): string | undefined {
    return CATALOG[category]?.find((asset) => asset.id === id)?.src;
}
