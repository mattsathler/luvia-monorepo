import { IsoGrid, LuvIcon } from "luv-ui";
import type { Character } from "../../lib/api";
import { CITY_TILE_SIZE, useHomePageController } from "./HomePage.controller";

type HomePageProps = {
    character: Character;
    onChangeCharacter: () => void;
};

export function HomePage({ character, onChangeCharacter }: HomePageProps) {
    const { logout, tiles, loadError } = useHomePageController({ character });

    return (
        <div className="d-flex flex-col gap p-24">
            <div className="d-flex items-center gap-8">
                <button
                    type="button"
                    className="outline primary circle w-40 h-40"
                    aria-label="Voltar para seleção de personagens"
                    onClick={onChangeCharacter}
                >
                    <LuvIcon name="arrow_back" />
                </button>
                <p className="text-text">
                    Você está logado como {character.firstName} {character.lastName}.
                </p>
            </div>
            <div className="d-flex gap-8">
                <button type="button" className="outline primary" onClick={logout}>
                    Sair
                </button>
            </div>

            {loadError && (
                <div className="card error w-full p-16">
                    <strong className="text-primary">{loadError}</strong>
                </div>
            )}

            {!tiles && !loadError && <p className="text-text">Carregando cidade...</p>}

            {tiles && (
                <div className="card outline w-full h-480">
                    <IsoGrid tiles={tiles} tileSize={CITY_TILE_SIZE} />
                </div>
            )}
        </div>
    );
}
