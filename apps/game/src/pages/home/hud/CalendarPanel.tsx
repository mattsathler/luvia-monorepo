import { LuvDivider, LuvIcon } from "luv-ui";
import type { Character } from "../../../lib/api";
import type { CurrentLot } from "../HomePage.controller";

// Espelha `Activity` em apps/api/src/character/domain/entities/activity.ts —
// sem tipo compartilhado entre os dois apps ainda, então cai pro id cru
// (`character.activity`) quando não reconhecido.
const ACTIVITY_LABELS: Record<string, string> = {
    idle: "Descansando",
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
        <div className="d-flex flex-col mr-24 gap-16 w-full">
            <div className="card flat border-1 border-border border-8 w-full d-flex justify-between p-8 px-16 items-center h-72">
                <div className="d-flex flex-row gap-16 items-center">
                    <LuvIcon name="chair" className="text-game-green"></LuvIcon>
                    <LuvDivider orientation="vertical" className="bg-border"></LuvDivider>
                    <div className="d-flex flex-col items-start">
                        <span>{activityLabel}</span>
                        <div className="d-flex items-center justify-center gap-4 text-text">
                            <LuvIcon name="location_on" size={12} className="text-game-green" />
                            <span className="text-placeholder text-size-12">{currentLot.name}</span>
                        </div>
                    </div>
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

            {/* <LuvDivider />

            <button className="outline w-full border-placeholder--force d-flex items-center gap-12 ">
                <LuvIcon name="add" className="text-placeholder"></LuvIcon>
                <LuvDivider orientation="vertical" className=""></LuvDivider>
                <span className="text-placeholder">Adicionar atividade</span>
                <div className="">
                </div>
            </button> */}

            {/* <div className="card flat border-1 border-dashed border-border border-8 w-full d-flex justify-between p-8 items-center">
                    <div className="d-flex flex-row gap-16 items-center">
                        <LuvIcon name="add" className="text-placeholder"></LuvIcon>
                        <LuvDivider orientation="vertical" className="bg-border"></LuvDivider>
                        <div className="d-flex flex-col items-start">
                            <span className="text-placeholder">Adicionar atividade</span>
                        </div>
                    </div>
                </div> */}
        </div>
    );
}