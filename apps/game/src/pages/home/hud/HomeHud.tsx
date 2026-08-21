import type { Character, Weather } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";
import { ProfilePanel } from "./ProfilePanel";
import { WorldClockPanel } from "./WorldClockPanel";
import { NavigationPanel } from "./NavigationPanel";

type HomeHudProps = {
    character: Character;
    currentLot: CurrentLot;
    /** Hora do jogo (0–24), já sincronizada — `null` até a primeira sincronização resolver (ver useWorldClock.ts). */
    hour: number | null;
    /** Dia da semana de jogo (0–6) — `null` até a primeira sincronização resolver. */
    weekday: number | null;
    /** Só cosmético nesta fase — `null` até a primeira sincronização resolver. */
    weather: Weather | null;
};

// Camada de UI por cima do mapa (ver HomePage.tsx). `pointer-events-none` no
// layer + `pointer-events-auto` em cada janela deixa os cliques passarem
// direto pro mapa nos espaços vazios entre painéis, em vez de bloquear a
// tela inteira. Grid de 3 colunas (em vez de `justify-between` com só 2
// itens) pra centralizar de verdade o painel do meio em relação à largura
// total, não só entre os outros dois painéis (que têm larguras diferentes).
export function HomeHud({ character, currentLot, hour, weekday, weather }: HomeHudProps) {
    return (
        <div className="pos-absolute top left w-full h-full pointer-events-none p-16 z-index-top">
            <div className="d-grid grid-cols-3 items-start w-full">
                <div className="d-flex">
                    <ProfilePanel character={character} />
                </div>

                <div className="d-flex justify-center">
                    <WorldClockPanel hour={hour} weekday={weekday} weather={weather} />
                </div>

                <div className="d-flex justify-end">
                    {/* <CalendarPanel character={character} currentLot={currentLot} /> */}
                </div>
            </div>

            <div className="pos-absolute bottom left w-full d-flex justify-center pointer-events-none">
                <NavigationPanel character={character} currentLot={currentLot}/>
            </div>
        </div>
    );
}
