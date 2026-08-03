import type { TileType, TileData } from "luv-ui";

export function generateCity(size = 100): TileData[] {
    const tiles: TileData[] = [];

    const beachSize = 2;
    const oceanSize = 4;
    const roadSpacing = 6;

    for (let y = 1; y <= size; y++) {
        for (let x = 1; x <= size; x++) {

            let type: TileType = "grass";

            // 🌊 OCEANO (bordas)
            if (
                x <= oceanSize || x > size - oceanSize ||
                y <= oceanSize || y > size - oceanSize
            ) {
                type = "ocean";
            }

            else if (
                x <= oceanSize + beachSize || x > size - (oceanSize + beachSize) ||
                y <= oceanSize + beachSize || y > size - (oceanSize + beachSize)
            ) {
                type = "sand";
            }

            else {
                const isMainRoad =
                    x === Math.floor(size / 2) ||
                    y === Math.floor(size / 2);

                const isSecondaryRoad =
                    x % roadSpacing === 0 ||
                    y % roadSpacing === 0;

                if (isMainRoad || isSecondaryRoad) {
                    type = "road";
                }
            }

            tiles.push({
                x,
                y,
                z: 1,
                color: "#ffffff00",
                type
            });
        }
    }

    return applyRoadDirection(tiles);
}

function applyRoadDirection(tiles: TileData[]): TileData[] {
    const map = new Map<string, TileData>();

    tiles.forEach(t => map.set(`${t.x},${t.y}`, t));

    const isRoad = (x: number, y: number) =>
        map.get(`${x},${y}`)?.type.startsWith("road");

    return tiles.map(tile => {
        if (!tile.type.startsWith("road")) return tile;

        const left = isRoad(tile.x - 1, tile.y);
        const right = isRoad(tile.x + 1, tile.y);
        const up = isRoad(tile.x, tile.y - 1);
        const down = isRoad(tile.x, tile.y + 1);

        // 🔥 cruzamento completo
        if (left && right && up && down) {
            return { ...tile, type: "road-i" };
        }

        // 👉 prioridade: direção horizontal
        if (right) {
            return { ...tile, type: "road-l" };
        }

        if (left) {
            return { ...tile, type: "road-r" };
        }

        // fallback
        return { ...tile, type: "road-r" };
    });
}