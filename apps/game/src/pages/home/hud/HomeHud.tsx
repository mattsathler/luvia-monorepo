import { LuvIcon } from "luv-ui";
import type { Character, Weather } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";
import { ProfilePanel } from "./ProfilePanel";
import { WorldClockPanel } from "./WorldClockPanel";
import { CalendarPanel } from "./CalendarPanel";
import { MapSearchPanel } from "./MapSearchPanel";

type HomeHudProps = {
    character: Character;
    currentLot: CurrentLot;
    /** Hora do jogo (0–24), já sincronizada — `null` até a primeira sincronização resolver (ver useWorldClock.ts). */
    hour: number | null;
    /** Dia da semana de jogo (0–6) — `null` até a primeira sincronização resolver. */
    weekday: number | null;
    /** Só cosmético nesta fase — `null` até a primeira sincronização resolver. */
    weather: Weather | null;
    /** Ligado: arrastar o mapa (navegar); desligado: clicar num lote pra inspecionar (ver CityGrid.tsx). */
    dragModeEnabled: boolean;
    onSetDragMode: (enabled: boolean) => void;
};

// Camada de UI por cima do mapa (ver HomePage.tsx). `pointer-events-none` no
// layer + `pointer-events-auto` em cada janela deixa os cliques passarem
// direto pro mapa nos espaços vazios entre painéis, em vez de bloquear a
// tela inteira. Grid de 3 colunas (em vez de `justify-between` com só 2
// itens) pra centralizar de verdade o painel do meio em relação à largura
// total, não só entre os outros dois painéis (que têm larguras diferentes).
export function HomeHud({
    character,
    currentLot,
    hour,
    weekday,
    weather,
    dragModeEnabled,
    onSetDragMode,
}: HomeHudProps) {
    return (
        <div className="pos-absolute top left w-full h-full pointer-events-none p-12 z-index-top">
            <div className="d-grid grid-cols-3 items-start w-full">
                <div className="d-flex">
                    <ProfilePanel character={character} />
                </div>

                <div className="d-flex justify-center items-center gap-16">
                    <WorldClockPanel hour={hour} weekday={weekday} weather={weather} />

                    {/* Navegar (arrastar o mapa) e inspecionar (clicar num
                        lote) são mutuamente exclusivos — ver CityGrid.tsx: no
                        Safari/macOS, detectar arrasto por distância
                        percorrida do ponteiro engolia cliques de mouse
                        parados, então o modo agora é uma escolha explícita do
                        jogador em vez de adivinhado. */}
                    <div className="d-flex items-center gap-8 pointer-events-auto">
                        <button
                            type="button"
                            className={`circle icon border-16 w-40 h-40 ${dragModeEnabled ? "bg-game-green" : "card"}`}
                            aria-label="Navegar pelo mapa"
                            aria-pressed={dragModeEnabled}
                            onClick={() => onSetDragMode(true)}
                        >
                            <LuvIcon name="open_with" size={20} className={dragModeEnabled ? "text-game-white" : "text-text"} />
                        </button>
                        <button
                            type="button"
                            className={`circle icon border-16 w-40 h-40 ${dragModeEnabled ? "card" : "bg-game-green"}`}
                            aria-label="Inspecionar um lote"
                            aria-pressed={!dragModeEnabled}
                            onClick={() => onSetDragMode(false)}
                        >
                            <LuvIcon name="visibility" size={20} className={dragModeEnabled ? "text-text" : "text-game-white"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="pos-absolute bottom left w-full d-flex justify-center items-center gap-8 pointer-events-none mb-16">
                {/* <NavigationPanel character={character} currentLot={currentLot}/> */}
                <CalendarPanel character={character} currentLot={currentLot} />
            </div>

            <div className="pos-absolute bottom left m-16 pointer-events-none d-flex flex-row">
                <MapSearchPanel character={character} />
            </div>
        </div>
    );
}
