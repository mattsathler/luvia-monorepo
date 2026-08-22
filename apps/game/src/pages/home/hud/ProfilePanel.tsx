import { LuvDivider, LuvExpandableBox, LuvIcon, LuvStatBar } from "luv-ui";
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
        <LuvExpandableBox
            trigger={
                <div className="w-72 bg-transparent">
                    <Player layers={characterToPlayerLayers(character)} part="head" />
                </div>
            }
            triggerLabel={`Perfil de ${character.firstName}`}
            defaultOpen
            className="border-16 card p-16"
            bodyClassName="w-164 d-flex flex-col gap-8 pointer-events-auto"
        >
            <div className="d-flex gap-8">

                <LuvDivider orientation="vertical"></LuvDivider>

                <div className="d-flex flex-col gap-8">
                    <strong className="text-text">
                        {character.firstName} {character.lastName}
                    </strong>

                    <div className="d-flex flex-col gap-4">
                        <LuvStatBar icon="sentiment_satisfied" label="Felicidade" value={character.happiness} max={MAX_STAT} color="game-green" />
                        <LuvStatBar icon="bolt" label="Energia" value={character.energy} max={MAX_STAT} color="game-yellow" />
                    </div>

                    <LuvDivider></LuvDivider>

                    <div className="d-grid grid-cols-2 items-center text-text">
                        <span className="d-flex items-center gap-4 justify-center items-center">
                            <LuvIcon name="payments" size={16} className="text-money" />
                            <span>{character.money}</span>
                        </span>
                        <span className="d-flex items-center gap-4 justify-center items-center">
                            <LuvIcon name="paid" size={16} className="text-cash" />
                            <span>{character.fame}</span>
                        </span>
                    </div>
                </div>
            </div>
        </LuvExpandableBox>
    );
}
