import { LuvIcon } from "luv-ui";
import type { Character } from "../../lib/api";
import { useHomePageController } from "./HomePage.controller";

type HomePageProps = {
    character: Character;
    onChangeCharacter: () => void;
};

export function HomePage({ character, onChangeCharacter }: HomePageProps) {
    const { logout } = useHomePageController();

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
        </div>
    );
}
