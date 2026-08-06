import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import type { Character } from "../lib/api";

export type CharacterState = {
    character: Character | null;
    selectCharacter: (character: Character) => void;
    clearCharacter: () => void;
};

const CharacterContext = createContext<CharacterState | undefined>(undefined);

export function CharacterProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [character, setCharacter] = useState<Character | null>(null);

    // Ao deslogar (ou expirar a sessão), esquece o personagem selecionado —
    // senão o próximo login reaproveitaria o estado da sessão anterior.
    useEffect(() => {
        if (!isAuthenticated) {
            setCharacter(null);
        }
    }, [isAuthenticated]);

    const value = useMemo<CharacterState>(
        () => ({
            character,
            selectCharacter: setCharacter,
            clearCharacter: () => setCharacter(null),
        }),
        [character],
    );

    return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacter(): CharacterState {
    const context = useContext(CharacterContext);

    if (!context) {
        throw new Error("useCharacter must be used within a CharacterProvider");
    }

    return context;
}
