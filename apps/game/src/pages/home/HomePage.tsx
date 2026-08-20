import { IsoGrid } from "luv-ui";
import type { Character } from "../../lib/api";
import { CITY_TILE_SIZE, isTileClickable, useHomePageController } from "./HomePage.controller";

type HomePageProps = {
    character: Character;
};

// O mapa ocupa a tela inteira — qualquer UI futura (HUD, painéis) fica
// sobreposta a ele, como num jogo, em vez de empurrar o mapa pra baixo.
export function HomePage({ character }: HomePageProps) {
    const { tiles, loadError, handleTileClick } = useHomePageController({ character });

    return (
        <div className="w-full h-screen">
            {loadError && (
                <div className="d-flex items-center justify-center w-full h-full">
                    <div className="card error p-16">
                        <strong className="text-primary">{loadError}</strong>
                    </div>
                </div>
            )}

            {!tiles && !loadError && (
                <div className="d-flex items-center justify-center w-full h-full">
                    <p className="text-text">Carregando cidade...</p>
                </div>
            )}

            {tiles && (
                <IsoGrid tiles={tiles} tileSize={CITY_TILE_SIZE} onTileClick={handleTileClick} isTileClickable={isTileClickable} />
            )}
        </div>
    );
}
