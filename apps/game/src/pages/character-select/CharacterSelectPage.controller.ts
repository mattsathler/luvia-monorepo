import { useEffect, useState, type KeyboardEvent } from "react";
import { listMyCharacters, type Character } from "../../lib/api";

type UseCharacterSelectPageControllerParams = {
    accessToken: string;
    onCharacterSelected: (character: Character) => void;
};

export function useCharacterSelectPageController({
    accessToken,
    onCharacterSelected,
}: UseCharacterSelectPageControllerParams) {
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

    return { characters, loadError, handleSelect, handleSelectKeyDown };
}
