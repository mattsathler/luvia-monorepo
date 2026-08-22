import { LuvIcon } from "luv-ui";
import type { Character, CurrentLot } from "../../../lib/api";

type NavigationItem = {
    id: string;
    label: string;
    icon: string;
    color: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
    { id: "profile", label: "Perfil", icon: "person", color: "game-purple" },
    { id: "relationships", label: "Relações", icon: "favorite", color: "game-pink" },
    { id: "career", label: "Carreira", icon: "work", color: "game-blue" },
    { id: "shop", label: "Loja", icon: "store", color: "game-orange" },
    { id: "settings", label: "Configurações", icon: "settings", color: "game-gray" },
];

// Nenhuma dessas telas existe ainda — os botões já ficam plugados (mesmo
// padrão de CalendarPanel#handleCancelActivity), só logam por enquanto, até
// cada tela ser implementada numa rodada futura.
function handleSelect(id: string) {
    // eslint-disable-next-line no-console
    console.log("Navegar para:", id);
}

export function NavigationPanel(_props: { character: Character, currentLot: CurrentLot }) {
    return (
        <div className="d-flex flex-col gap-8">
            <div className="card mb-8 p-8 d-flex gap-8 items-center pointer-events-auto">
                {NAVIGATION_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`circle outline d-flex flex-col items-center w-64--force h-64--force text-${item.color}`}
                        onClick={() => handleSelect(item.id)}
                    >
                        <LuvIcon name={item.icon} color={item.color} size={20} />
                    </button>
                ))}
            </div>
        </div>
    );
}
