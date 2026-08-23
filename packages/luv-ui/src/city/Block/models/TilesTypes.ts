import grass from "../textures/grass.png";
import roadL from "../textures/road-l.png";
import roadR from "../textures/road-r.png";
import roadI from "../textures/road-i.png";
import roadCornerDr from "../textures/road-corner-dr.png";
import roadCornerDl from "../textures/road-corner-dl.png";
import roadCornerLu from "../textures/road-corner-lu.png";
import roadCornerRu from "../textures/road-corner-ru.png";
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

    // Curvas de 90° — nome codifica as duas direções de vizinho de rua que a
    // curva conecta (d=down/y+1, l=left/x-1, r=right/x+1, u=up/y-1), ver
    // apps/api/src/city/domain/entities/generate-roads.ts#resolveOrientation.
    'road-corner-dr': {
        color: "#ffffff00",
        texture: roadCornerDr,
    },

    'road-corner-dl': {
        color: "#ffffff00",
        texture: roadCornerDl,
    },

    'road-corner-lu': {
        color: "#ffffff00",
        texture: roadCornerLu,
    },

    'road-corner-ru': {
        color: "#ffffff00",
        texture: roadCornerRu,
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
    },

    // Lote ocupado por outro jogador — reaproveita a textura de grass com um
    // tingimento (color-mix + multiply em Block.scss já cuida do resto).
    'lot': {
        color: "#c9a06699",
        texture: grass,
    },

    // O lote do jogador logado, destacado na grade da cidade.
    'lot-mine': {
        color: "#ffd54fcc",
        texture: grass,
    },

    // Ponto de interesse (prédio público) — reaproveita a textura de grass
    // com um tingimento próprio, sem precisar de arte nova.
    'landmark': {
        color: "#6c63ffcc",
        texture: grass,
    },
};

export type TileType = keyof typeof TILE_TYPES;