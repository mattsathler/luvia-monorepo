import { LuvDivider, LuvIcon } from "luv-ui";
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
        <div className="card p-16 mr-24 gap-8 items-center border-border w-240">
            <div className="w-full p-8 text-center d-flex flex-col gap-8 pointer-events-auto">
                <span>Atividade atual</span>
                <LuvDivider />
                <div className="card flat game-lightblue w-full d-flex justify-between p-8 px-16 items-center h-72">

                    <div className="d-flex flex-row gap-4 items-center">
                        <LuvIcon name="work"></LuvIcon>
                        <LuvDivider orientation="vertical" className="border-text bg-text"></LuvDivider>
                        <span>{activityLabel}</span>
                    </div>

                    {!isIdle && (
                        <button
                            type="button"
                            className="circle icon border-text w-16 h-16"
                            aria-label="Cancelar atividade"
                            onClick={handleCancelActivity}
                        >
                            <LuvIcon name="close" className="text-size-12" />
                        </button>
                    )}
                </div>

                <LuvDivider />

                <div className="d-flex items-center justify-center gap-4 text-text">
                    <LuvIcon name="location_on" size={16} />
                    <span>{currentLot.name}</span>
                    <span className="text-placeholder">
                        ({currentLot.x}, {currentLot.y})
                    </span>
                </div>
            </div>
        </div>
    );
}
