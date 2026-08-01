export type TILE_TYPES = {
    grass: {
        color: string;
        texture: any;
    };
    road: {
        color: string;
        texture: any;
    };
    'road-r': {
        color: string;
        texture: any;
    };
    'road-l': {
        color: string;
        texture: any;
    };
    'road-i': {
        color: string;
        texture: any;
    };
    sand: {
        color: string;
        texture: any;
    };
    ocean: {
        color: string;
        texture: any;
    };
    autumn: {
        color: string;
        texture: any;
    };
    snow: {
        color: string;
        texture: any;
    };
};
export type TileType = keyof typeof TILE_TYPES;
//# sourceMappingURL=TilesTypes.d.ts.map