import { CityGrid } from "./CityGrid";
import { HomeHud } from "./hud/HomeHud";
import type { Character } from "../../lib/api";
import { isTileClickable, useHomePageController } from "./HomePage.controller";
import { useWorldClockLighting } from "./useWorldClockLighting";

type HomePageProps = {
    character: Character;
};

// O mapa ocupa a tela inteira — qualquer UI futura (HUD, painéis) fica
// sobreposta a ele, como num jogo, em vez de empurrar o mapa pra baixo.
export function HomePage({ character }: HomePageProps) {
    const { dimensions, currentLot, loadError, handleTileClick, accessToken, tileSize } = useHomePageController({ character });
    useWorldClockLighting();

    return (
        <div className="pos-relative w-full h-screen hidden">
            {loadError && (
                <div className="d-flex items-center justify-center w-full h-full">
                    <div className="card error p-16">
                        <strong className="text-primary">{loadError}</strong>
                    </div>
                </div>
            )}

            {!dimensions && !loadError && (
                <div className="d-flex items-center justify-center w-full h-full">
                    <p className="text-text">Carregando cidade...</p>
                </div>
            )}

            {dimensions && accessToken && currentLot && (
                <>
                    <CityGrid
                        dimensions={dimensions}
                        tileSize={tileSize}
                        backgroundColor={dimensions.backgroundColor}
                        accessToken={accessToken}
                        characterId={character.id}
                        onTileClick={handleTileClick}
                        isTileClickable={isTileClickable}
                    />
                    <HomeHud character={character} currentLot={currentLot} />
                </>
            )}
        </div>
    );
}
