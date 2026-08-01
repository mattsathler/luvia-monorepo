import grass from "../textures/grass.png";
import roadL from "../textures/road-l.png";
import roadR from "../textures/road-r.png";
import roadI from "../textures/road-i.png";
import sand from '../textures/sand.png';
import ocean from '../textures/ocean.png';
import autumn from '../textures/autumn.png';
import snow from '../textures/snow.png';

export const TILE_TYPES = {
    grass: {
        color: "#ffffff00",
        texture: grass,
    },

    'road': {
        color: "#ffffff00",
        texture: roadR,
    },

    'road-r': {
        color: "#ffffff00",
        texture: roadR,
    },

    'road-l': {
        color: "#ffffff00",
        texture: roadL,
    },

    'road-i': {
        color: "#ffffff00",
        texture: roadI,
    },

    sand: {
        color: "#ffffff00",
        texture: sand,
    },

    ocean: {
        color: "#ffffff00",
        texture: ocean,
    },

    autumn: {
        color: "#ffffff00",
        texture: autumn,
    },

    snow: {
        color: "#ffffff00",
        texture: snow,
    }
};

export type TileType = keyof typeof TILE_TYPES;