import { LuvSpinner } from "luv-ui";
import { CityGrid } from "./CityGrid";
import { HomeHud } from "./hud/HomeHud";
import { LotDetailModal } from "./LotDetailModal";
import type { Character } from "../../lib/api";
import { isTileClickable, useHomePageController } from "./HomePage.controller";
import { useWorldClock } from "./useWorldClock";
import { useWorldClockLighting } from "./useWorldClockLighting";

type HomePageProps = {
    character: Character;
    /** Lote pra centralizar o mapa nele ao entrar — vem de `?x=&y=` na URL (ver App.tsx), ex.: link compartilhado ou clique no MapSearchPanel. */
    targetLot?: { x: number; y: number } | null;
};

// O mapa ocupa a tela inteira — qualquer UI futura (HUD, painéis) fica
// sobreposta a ele, como num jogo, em vez de empurrar o mapa pra baixo.
export function HomePage({ character, targetLot = null }: HomePageProps) {
    const {
        dimensions,
        currentLot,
        loadError,
        handleTileClick,
        selectedLot,
        closeLotModal,
        accessToken,
        tileSize,
        dragModeEnabled,
        toggleDragMode,
    } = useHomePageController({ character });
    const worldClock = useWorldClock();
    useWorldClockLighting(worldClock?.hour ?? null);

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
                    <LuvSpinner label="Carregando cidade..." />
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
                        targetLot={targetLot}
                        dragModeEnabled={dragModeEnabled}
                    />
                    <HomeHud
                        character={character}
                        currentLot={currentLot}
                        hour={worldClock?.hour ?? null}
                        weekday={worldClock?.weekday ?? null}
                        weather={worldClock?.weather ?? null}
                        dragModeEnabled={dragModeEnabled}
                        onToggleDragMode={toggleDragMode}
                    />
                    <LotDetailModal
                        lot={selectedLot}
                        accessToken={accessToken}
                        currentCharacter={character}
                        onClose={closeLotModal}
                    />
                </>
            )}
        </div>
    );
}
