import { LuvDivider, LuvExpandableBox, LuvIcon } from "luv-ui";
import type { Character } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";

// Espelha `Activity` em apps/api/src/character/domain/entities/activity.ts —
// sem tipo compartilhado entre os dois apps ainda, então cai pro id cru
// (`character.activity`) quando não reconhecido.
const ACTIVITY_LABELS: Record<string, string> = {
    idle: "Nenhuma",
    resting: "Descansando",
    working: "Trabalhando",
};

type CalendarPanelProps = {
    character: Character;
    currentLot: CurrentLot;
};

export function CalendarPanel({ character, currentLot }: CalendarPanelProps) {
    const isIdle = character.activity === "idle";
    const activityLabel = ACTIVITY_LABELS[character.activity] ?? character.activity;

    // Cancelar atividade ainda não tem endpoint (ver
    // apps/api/src/character/domain/entities/activity.ts) — o botão fica
    // plugado pra próxima rodada, só loga por enquanto.
    function handleCancelActivity() {
        // eslint-disable-next-line no-console
        console.log("Cancelar atividade:", character.activity);
    }

    return (
        <LuvExpandableBox
            trigger={
                <div className="d-flex items-center justify-center gap-4 text-text">
                    <LuvIcon name="chair" size={40} className="text-game-green"></LuvIcon>
                </div>
            }
            triggerLabel={`Atividade de ${character.firstName}`}
            origin="bottom-center"
            defaultOpen
            className="border-16 card"
            bodyClassName="w-164 d-flex flex-col gap-8 pointer-events-auto items-center"
        >
            <div className="d-flex items-center gap-4">
                <LuvDivider orientation="vertical" className="bg-placeholder"></LuvDivider>
                <div className="d-flex flex-col border-1 border-16 justify-between items-center py-4 px-16">
                    <span>{activityLabel}</span>
                    <div className="d-flex flex-row gap-4 items-center">
                        <LuvIcon name="location_on" size={12} className="text-game-green" />
                        <span className="text-placeholder text-size-12">{currentLot.name}</span>
                    </div>
                </div>

                {!isIdle && (
                    <button
                        type="button"
                        className="circle icon border-error w-16 h-16"
                        aria-label="Cancelar atividade"
                        onClick={handleCancelActivity}
                    >
                        <LuvIcon name="close" className="text-size-12 text-error" />
                    </button>
                )}
            </div>
        </LuvExpandableBox>
    );
}