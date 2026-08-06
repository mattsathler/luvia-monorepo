import { useEffect, useState, type KeyboardEvent } from "react";
import { luviaLogo } from "luv-ui";
import { useAuth } from "../../auth/AuthContext";
import { listMyCharacters, type Character } from "../../lib/api";
import { Player } from "../../components/Player/Player";
import { characterToPlayerLayers } from "../../components/Player/characterToPlayerLayers";

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
    const [characters, setCharacters] = useState<Character[] | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        listMyCharacters(accessToken)
            .then(setCharacters)
            .catch(() => setLoadError("Não foi possível carregar seus personagens. Tente novamente."));
    }, [accessToken]);

    function handleSelect(character: Character) {
        onCharacterSelected(character);
    }

    function handleSelectKeyDown(event: KeyboardEvent, character: Character) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect(character);
        }
    }

    return (
        <div className="d-flex flex-col items-center justify-center w-full h-full p-24">
            <img src={luviaLogo} alt="Luvia" className="w-50-p max-w-640" />

            <div className="card d-flex flex-col gap w-50-p items-center">
                {loadError && (
                    <div className="card error w-full p-16">
                        <strong className="text-primary">{loadError}</strong>
                    </div>
                )}

                {characters === null && !loadError && <p className="text-text">Carregando personagens...</p>}

                {characters !== null && characters.length === 0 && (
                    <p className="text-text">Você ainda não tem nenhum personagem.</p>
                )}

                {characters !== null && characters.length > 0 && (
                    <>
                        <h1 className="text-text">Selecione seu personagem</h1>
                        <div className="d-grid grid-wrap gap-16 w-full">
                            {characters.map((character) => (
                                <button
                                    key={character.id}
                                    type="button"
                                    className="card outline d-flex flex-col items-center gap-8 max-h-480"
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
                        </div>
                    </>
                )}

                {characters !== null && (
                    <button type="button" className="primary" onClick={onCreateNew}>
                        Criar novo personagem
                    </button>
                )}
            </div>
        </div>
    );
}
