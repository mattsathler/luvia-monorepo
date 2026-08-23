import { LuvDivider, LuvIcon, LuvModal, LuvSpinner } from "luv-ui";
import type { Character, Lot } from "../../lib/api";
import { useLotDetailModalController } from "./LotDetailModal.controller";

type LotDetailModalProps = {
    lot: Lot | null;
    accessToken: string;
    currentCharacter: Character;
    onClose: () => void;
};

// Ações ainda não existem no backend (só há endpoints de leitura pra lotes
// hoje) — os botões abaixo ficam desabilitados de propósito, preparando o
// layout pra quando "Construir"/"Visitar" tiverem uma ação real por trás.
export function LotDetailModal({ lot, accessToken, currentCharacter, onClose }: LotDetailModalProps) {
    const { typeLabel, ownerName, isLoadingOwner } = useLotDetailModalController({ lot, accessToken, currentCharacter });

    return (
        <LuvModal isOpen={lot !== null} onClose={onClose} title="Detalhes do lote" size="small" variant="secondary">
            {lot && (
                <div className="d-flex flex-col gap">
                    <div className="d-grid grid-cols-2 gap mt-24">
                        <div className="d-flex flex-col">
                            <span className="text-placeholder text-size-12">Dono</span>
                            {isLoadingOwner ? <LuvSpinner size={16} /> : <span className="text-text">{ownerName}</span>}
                        </div>

                        <div className="d-flex flex-col">
                            <span className="text-placeholder text-size-12">Tipo</span>
                            <span className="text-text">{typeLabel}</span>
                        </div>
                    </div>

                    <div className="d-flex flex-col">
                        <span className="text-placeholder text-size-12">Coordenadas</span>
                        <span className="text-text">
                            {lot.x}, {lot.y}
                        </span>
                    </div>

                    <LuvDivider />

                    <div className="d-flex flex-row justify-end gap-16">
                        <button className="icon circle w-40 h-40 game-cyan text-game-white" disabled>
                            <LuvIcon name="store"></LuvIcon>
                        </button>
                        <button className="icon circle w-40 h-40 game-green text-game-white" disabled>
                            <LuvIcon name="work"></LuvIcon>
                        </button>
                    </div>
                </div>
            )}
        </LuvModal>
    );
}
