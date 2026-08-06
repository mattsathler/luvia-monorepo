function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        image.src = src;
    });
}

type BoundingBox = { minX: number; minY: number; maxX: number; maxY: number };

function contentBoundingBox(context: CanvasRenderingContext2D, width: number, height: number): BoundingBox | null {
    const { data } = context.getImageData(0, 0, width, height);

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
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
 * Recorta a blank area transparente ao redor do conteúdo de um PNG de peça
 * de personagem — ver docs/decisions/0020-assets-de-personagem-em-canvas-fixo-com-blank-area.md.
 * Cada peça é exportada num canvas fixo bem maior que o desenho em si (para
 * que as camadas se alinhem ao empilhar), o que deixa uma miniatura isolada
 * (ex.: swatch de tom de pele) com a maior parte do espaço vazia. Não usar
 * isto para compor camadas sobrepostas — o recorte quebra o alinhamento
 * entre elas; para isso ver `composeAndTrimLayers`.
 */
export async function trimTransparentPadding(src: string): Promise<string> {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) {
        return src;
    }

    context.drawImage(image, 0, 0);

    const box = contentBoundingBox(context, canvas.width, canvas.height);
    if (!box) {
        return src;
    }

    return cropToBoundingBox(canvas, box) ?? src;
}

/**
 * Empilha várias peças (na ordem dada, de baixo para cima) num único canvas
 * e recorta o resultado para a blank area do conjunto — como todas as peças
 * nascem no mesmo canvas fixo (ver docs/decisions/0020-...), desenhá-las
 * todas em `(0,0)` já as alinha corretamente; só o recorte final precisa de
 * cálculo. Usado para a prévia ao vivo do personagem.
 */
export async function composeAndTrimLayers(sources: string[]): Promise<string> {
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

    const box = contentBoundingBox(context, width, height);
    if (!box) {
        return fallback;
    }

    return cropToBoundingBox(canvas, box) ?? fallback;
}
