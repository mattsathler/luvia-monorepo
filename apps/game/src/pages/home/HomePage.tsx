import { useAuth } from "../../auth/AuthContext";
import type { Character } from "../../lib/api";

type HomePageProps = {
    character: Character;
    onChangeCharacter: () => void;
};

export function HomePage({ character, onChangeCharacter }: HomePageProps) {
    const { logout } = useAuth();

    return (
        <div className="d-flex flex-col gap p-24">
            <p className="text-text">
                Você está logado como {character.firstName} {character.lastName}.
            </p>
            <div className="d-flex gap-8">
                <button type="button" className="outline primary" onClick={onChangeCharacter}>
                    Trocar personagem
                </button>
                <button type="button" className="outline primary" onClick={logout}>
                    Sair
                </button>
            </div>
        </div>
    );
}
