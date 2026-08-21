import { LuvDivider, LuvDropdownCard, LuvIcon, LuvStatBar } from "luv-ui";
import type { Character } from "../../../lib/api";
import { Player } from "../../../components/Player/Player";
import { characterToPlayerLayers } from "../../../components/Player/characterToPlayerLayers";

// Felicidade e energia são sempre 0..100 (ver
// apps/api/src/character/domain/entities/character.entity.ts) — fama e
// dinheiro não têm teto, por isso aparecem como valor solto, não como barra.
const MAX_STAT = 100;

type ProfilePanelProps = {
    character: Character;
};

export function ProfilePanel({ character }: ProfilePanelProps) {
    return (
        <LuvDropdownCard
            title="Perfil"
            className="border-border py-16 pl-0 pr-24 max-w-480"
            bodyClassName="d-grid grid-cols-2 gap-8 items-center"
        >
            <div className="h-128 bg-transparent">
                <Player layers={characterToPlayerLayers(character)} />
            </div>

            <div className="d-flex flex-col gap-8 pointer-events-auto">
                <div className="d-flex gap-16 items-center">

                    <div className="d-flex flex-col gap-4 flex-1-1">
                        <strong className="text-text text-size-20">
                            {character.firstName} {character.lastName}
                        </strong>
                    </div>
                </div>

                <LuvDivider></LuvDivider>

                <div className="d-flex flex-col gap-8">
                    <LuvStatBar icon="sentiment_satisfied" label="Felicidade" value={character.happiness} max={MAX_STAT} color="game-green" />
                    <LuvStatBar icon="bolt" label="Energia" value={character.energy} max={MAX_STAT} color="game-yellow" />
                </div>

                <LuvDivider></LuvDivider>

                <div className="d-flex items-center gap-8 text-text">
                    <span className="d-flex items-center gap-4">
                        <LuvIcon name="payments" size={20} className="text-game-green contour" />
                        <strong>{character.money}</strong>
                    </span>

                    <span className="d-flex items-center gap-4">
                        <LuvIcon name="star" size={16} className="text-game-yellow contour" />
                        <strong>{character.fame}</strong>
                    </span>
                </div>
            </div>
        </LuvDropdownCard>
    );
}
