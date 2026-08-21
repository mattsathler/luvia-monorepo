import { LuvIcon } from "luv-ui";
import { CalendarPanel } from "./CalendarPanel";
import type { Character, CurrentLot } from "../../../lib/api";

type NavigationItem = {
    id: string;
    label: string;
    icon: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
    { id: "profile", label: "Perfil", icon: "person" },
    { id: "relationships", label: "Relações", icon: "favorite" },
    { id: "career", label: "Carreira", icon: "work" },
    { id: "shop", label: "Loja", icon: "store" },
    { id: "settings", label: "Configurações", icon: "settings" },
];

// Nenhuma dessas telas existe ainda — os botões já ficam plugados (mesmo
// padrão de CalendarPanel#handleCancelActivity), só logam por enquanto, até
// cada tela ser implementada numa rodada futura.
function handleSelect(id: string) {
    // eslint-disable-next-line no-console
    console.log("Navegar para:", id);
}

export function NavigationPanel(props: {character: Character, currentLot: CurrentLot}) {
    return (
        <div className="d-flex flex-col gap-8">
            <CalendarPanel character={props.character} currentLot={props.currentLot} />
            <div className="card mb-24 p-4 d-flex gap-8 items-center pointer-events-auto">
                {NAVIGATION_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className="circle d-flex flex-col items-center w-90--force h-90--force game-white"
                        onClick={() => handleSelect(item.id)}
                    >
                        <LuvIcon name={item.icon} className="text-placeholder" size={24} />
                        {/* <span className="text-text text-size-12">{item.label}</span> */}
                    </button>
                ))}
            </div>
        </div>
    );
}
