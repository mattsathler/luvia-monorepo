import { LuvIcon, luviaLogo } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import type { Character } from "../../lib/api";
import { Player } from "../../components/Player/Player";
import { characterToPlayerLayers } from "../../components/Player/characterToPlayerLayers";
import { useCharacterSelectPageController } from "./CharacterSelectPage.controller";

type CharacterSelectPageProps = {
    onCharacterSelected: (character: Character) => void;
    onCreateNew: () => void;
};

export function CharacterSelectPage({ onCharacterSelected, onCreateNew }: CharacterSelectPageProps) {
    const { accessToken } = useAuth();

    // Esta página só é montada quando o jogador está autenticado (ver
    // AppContent em App.tsx), então accessToken sempre existe aqui — o guard
    // só evita um `as string` no restante do componente.
    if (!accessToken) {
        return null;
    }

    return (
        <CharacterSelectPageContent
            accessToken={accessToken}
            onCharacterSelected={onCharacterSelected}
            onCreateNew={onCreateNew}
        />
    );
}

type CharacterSelectPageContentProps = CharacterSelectPageProps & {
    accessToken: string;
};

function CharacterSelectPageContent({ accessToken, onCharacterSelected, onCreateNew }: CharacterSelectPageContentProps) {
    const { characters, loadError, handleSelect, handleSelectKeyDown } = useCharacterSelectPageController({
        accessToken,
        onCharacterSelected,
    });

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            {/* <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" /> */}

            <div className="card d-flex flex-col gap w-50-p items-center">
                {loadError && (
                    <div className="card error w-full p-16">
                        <strong className="text-primary">{loadError}</strong>
                    </div>
                )}

                {characters === null && !loadError && <p className="text-text">Carregando personagens...</p>}

                {characters !== null && (
                    <>
                        <div className="d-flex w-full justify-between gap flex-row">
                            <h1 className="text-text">Selecione seu personagem</h1>
                        </div>

                        {characters.length === 0 && (
                            <p className="text-text">Você ainda não tem nenhum personagem.</p>
                        )}

                        <div className="d-flex gap-16 w-full">
                            {characters.map((character) => (
                                <button
                                    key={character.id}
                                    type="button"
                                    className="card outline d-flex flex-col items-center gap-8 max-h-none w-240"
                                    aria-label={`${character.firstName} ${character.lastName}`}
                                    onClick={() => handleSelect(character)}
                                    onKeyDown={(event) => handleSelectKeyDown(event, character)}
                                >
                                    <Player layers={characterToPlayerLayers(character)} />
                                    <strong className="text-text">
                                        {character.firstName} {character.lastName}
                                    </strong>
                                </button>
                            ))}
                            <button
                                type="button"
                                className="card outline d-flex flex-col items-center justify-center gap-8 max-h-none w-240"
                                aria-label="Criar novo personagem"
                                onClick={onCreateNew}
                            >
                                <LuvIcon name="add" size={40} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
