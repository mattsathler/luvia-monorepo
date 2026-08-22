import { LuvDivider, LuvModal } from "luv-ui";
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
    const { typeLabel, ownerName } = useLotDetailModalController({ lot, accessToken, currentCharacter });

    return (
        <LuvModal isOpen={lot !== null} onClose={onClose} title="Detalhes do lote" size="small">
            {lot && (
                <div className="d-flex flex-col gap-8">
                    <div className="d-flex flex-col">
                        <span className="text-placeholder text-size-12">Dono</span>
                        <span className="text-text">{ownerName}</span>
                    </div>

                    <LuvDivider />

                    <div className="d-flex flex-col">
                        <span className="text-placeholder text-size-12">Tipo</span>
                        <span className="text-text">{typeLabel}</span>
                    </div>

                    <LuvDivider />

                    <div className="d-flex flex-col">
                        <span className="text-placeholder text-size-12">Coordenadas</span>
                        <span className="text-text">
                            {lot.x}, {lot.y}
                        </span>
                    </div>

                    <div className="d-flex gap-8 mt-16">
                        <button type="button" className="outline" disabled>
                            Construir
                        </button>
                        <button type="button" className="outline" disabled>
                            Visitar
                        </button>
                    </div>
                </div>
            )}
        </LuvModal>
    );
}
