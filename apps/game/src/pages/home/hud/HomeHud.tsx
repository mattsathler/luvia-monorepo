import type { Character } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";
import { ProfilePanel } from "./ProfilePanel";
import { CalendarPanel } from "./CalendarPanel";

type HomeHudProps = {
    character: Character;
    currentLot: CurrentLot;
};

// Camada de UI por cima do mapa (ver HomePage.tsx). `pointer-events-none` no
// layer + `pointer-events-auto` em cada janela deixa os cliques passarem
// direto pro mapa nos espaços vazios entre painéis, em vez de bloquear a
// tela inteira.
export function HomeHud({ character, currentLot }: HomeHudProps) {
    return (
        <div className="pos-absolute top left w-full h-full pointer-events-none p-16 z-index-top">
            <div className="d-flex justify-between items-start w-full">
                <ProfilePanel character={character} />
                <CalendarPanel character={character} currentLot={currentLot} />
            </div>
        </div>
    );
}
