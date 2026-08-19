import { afterEach, describe, expect, it, vi } from "vitest";
import { composeAndTrimLayers } from "./image-trim";

class FakeImage {
    naturalWidth: number;
    naturalHeight: number;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private shouldFail: boolean;

    constructor(width: number, height: number, shouldFail = false) {
        this.naturalWidth = width;
        this.naturalHeight = height;
        this.shouldFail = shouldFail;
    }

    set src(_value: string) {
        queueMicrotask(() => {
            if (this.shouldFail) {
                this.onerror?.();
            } else {
                this.onload?.();
            }
        });
    }
}

function fakeContext(imageData: { data: Uint8ClampedArray; width: number; height: number }) {
    return {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => imageData),
    };
}

function fakeCanvas(context: ReturnType<typeof fakeContext> | null) {
    return {
        width: 0,
        height: 0,
        getContext: vi.fn(() => context),
        toDataURL: vi.fn(() => "data:image/png;base64,trimmed"),
    };
}

function stubImages(images: FakeImage[]) {
    let created = 0;
    vi.stubGlobal("Image", function () {
        return images[created++];
    } as unknown as typeof Image);
}

function stubCanvases(canvases: ReturnType<typeof fakeCanvas>[]) {
    const realCreateElement = document.createElement.bind(document);
    let created = 0;
    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
        if (tag === "canvas") {
            return canvases[created++] as unknown as HTMLCanvasElement;
        }
        return realCreateElement(tag);
    }) as typeof document.createElement);
}

describe("composeAndTrimLayers", () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("throws when given no layers", async () => {
        await expect(composeAndTrimLayers([])).rejects.toThrow("composeAndTrimLayers requires at least one layer");
    });

    it("rejects when a layer image fails to load", async () => {
        stubImages([new FakeImage(2, 2, true)]);

        await expect(composeAndTrimLayers(["missing.png"])).rejects.toThrow("Failed to load image: missing.png");
    });

    it("draws every layer at the origin and crops to their combined bounding box", async () => {
        // Pontos escolhidos para exercitar os quatro ramos de comparação do
        // bounding box (x/y menor que o mínimo, x/y maior que o máximo) tanto
        // no caminho verdadeiro quanto no falso, na ordem de varredura
        // (linha a linha, esquerda pra direita): (2,1) então (3,1) então (1,2).
        const width = 4;
        const height = 4;
        const data = new Uint8ClampedArray(width * height * 4);
        const setAlpha = (x: number, y: number, alpha: number) => {
            data[(y * width + x) * 4 + 3] = alpha;
        };
        setAlpha(2, 1, 255);
        setAlpha(3, 1, 255);
        setAlpha(1, 2, 255);

        stubImages([new FakeImage(width, height), new FakeImage(width, height)]);

        const sourceContext = fakeContext({ data, width, height });
        const sourceCanvas = fakeCanvas(sourceContext);
        const trimmedContext = fakeContext({ data, width, height });
        const trimmedCanvas = fakeCanvas(trimmedContext);
        stubCanvases([sourceCanvas, trimmedCanvas]);

        const result = await composeAndTrimLayers(["body.png", "face.png"]);

        expect(sourceContext.drawImage).toHaveBeenNthCalledWith(1, expect.any(FakeImage), 0, 0);
        expect(sourceContext.drawImage).toHaveBeenNthCalledWith(2, expect.any(FakeImage), 0, 0);
        expect(result).toBe("data:image/png;base64,trimmed");
    });

    it("returns the last layer's src when the composite is fully transparent", async () => {
        const width = 2;
        const height = 2;
        const data = new Uint8ClampedArray(width * height * 4);

        stubImages([new FakeImage(width, height)]);
        stubCanvases([fakeCanvas(fakeContext({ data, width, height }))]);

        const result = await composeAndTrimLayers(["only-layer.png"]);

        expect(result).toBe("only-layer.png");
    });

    it("returns the last layer's src when a 2d context is unavailable", async () => {
        stubImages([new FakeImage(2, 2)]);
        stubCanvases([fakeCanvas(null)]);

        const result = await composeAndTrimLayers(["body.png"]);

        expect(result).toBe("body.png");
    });

    it("returns the last layer's src when the trimmed canvas has no 2d context", async () => {
        const width = 2;
        const height = 2;
        const data = new Uint8ClampedArray(width * height * 4);
        data[3] = 255; // opaque pixel at (0,0)

        stubImages([new FakeImage(width, height)]);
        stubCanvases([fakeCanvas(fakeContext({ data, width, height })), fakeCanvas(null)]);

        const result = await composeAndTrimLayers(["body.png"]);

        expect(result).toBe("body.png");
    });
});
