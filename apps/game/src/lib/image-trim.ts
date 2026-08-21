function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
    });
}

type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * Retângulo em frações (0..1) do canvas fixo — ver
 * docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * Como toda peça nasce ancorada no mesmo canvas, um recorte por fração
 * (em vez de pixels absolutos) funciona igual pra qualquer resolução de
 * asset, sem precisar saber o tamanho exato em pixels.
 */
export type CanvasRegion = { minXFrac: number; minYFrac: number; maxXFrac: number; maxYFrac: number };

function regionToBounds(region: CanvasRegion, width: number, height: number): BoundingBox {
    return {
        minX: Math.max(0, Math.floor(region.minXFrac * width)),
        minY: Math.max(0, Math.floor(region.minYFrac * height)),
        maxX: Math.min(width - 1, Math.ceil(region.maxXFrac * width) - 1),
        maxY: Math.min(height - 1, Math.ceil(region.maxYFrac * height) - 1),
    };
}

function contentBoundingBox(context: CanvasRenderingContext2D, width: number, height: number, searchBounds?: BoundingBox): BoundingBox | null {
    const { data } = context.getImageData(0, 0, width, height);
    const bounds = searchBounds ?? { minX: 0, minY: 0, maxX: width - 1, maxY: height - 1 };

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = bounds.minY; y <= bounds.maxY; y++) {
        for (let x = bounds.minX; x <= bounds.maxX; x++) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 0) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    return maxX < minX || maxY < minY ? null : { minX, minY, maxX, maxY };
}

function cropToBoundingBox(source: HTMLCanvasElement, box: BoundingBox): string | null {
    const width = box.maxX - box.minX + 1;
    const height = box.maxY - box.minY + 1;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        return null;
    }

    context.drawImage(source, box.minX, box.minY, width, height, 0, 0, width, height);

    return canvas.toDataURL("image/png");
}

/**
 * Empilha várias peças (na ordem dada, de baixo para cima) num único canvas
 * e recorta o resultado para a blank area do conjunto — como todas as peças
 * nascem no mesmo canvas fixo (ver docs/decisions/0020-...), desenhá-las
 * todas em `(0,0)` já as alinha corretamente; só o recorte final precisa de
 * cálculo. Usado para a prévia ao vivo do personagem.
 *
 * `region`, se informado, restringe o recorte a uma fração do canvas fixo
 * (ex.: só a cabeça) antes de apertar pro conteúdo real — ver `CanvasRegion`
 * e os presets em `Player.tsx`.
 */
export async function composeAndTrimLayers(sources: string[], region?: CanvasRegion): Promise<string> {
    if (sources.length === 0) {
        throw new Error("composeAndTrimLayers requires at least one layer");
    }

    const images = await Promise.all(sources.map(loadImage));
    const fallback = sources[sources.length - 1];

    const width = images[0].naturalWidth;
    const height = images[0].naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
        return fallback;
    }

    for (const image of images) {
        context.drawImage(image, 0, 0);
    }

    const searchBounds = region ? regionToBounds(region, width, height) : undefined;
    const box = contentBoundingBox(context, width, height, searchBounds);
    if (!box) {
        return fallback;
    }

    return cropToBoundingBox(canvas, box) ?? fallback;
}
