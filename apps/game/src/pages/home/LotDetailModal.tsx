import { Block, LuvDivider, LuvIcon, LuvModal, LuvSpinner, TILE_TYPES } from "luv-ui";
import type { Character } from "../../lib/api";
import { useLotDetailModalController, type LotSelection } from "./LotDetailModal.controller";

type LotDetailModalProps = {
    selection: LotSelection | null;
    accessToken: string;
    currentCharacter: Character;
    onClose: () => void;
};

export function LotDetailModal({ selection, accessToken, currentCharacter, onClose }: LotDetailModalProps) {
    const { x, y, typeLabel, ownerName, isOwnLot, isLoadingOwner, neighborhood, isLoadingNeighborhood, tip } =
        useLotDetailModalController({ selection, accessToken, currentCharacter });

    // Mesmo tingimento já usado na grade da cidade (ver TilesTypes.ts) —
    // reaproveita a arte existente em vez de precisar de uma ilustração nova
    // por lote (ainda não há "construção" pra desenhar, ver regra I).
    const previewTileType = !selection?.lot ? "grass" : isOwnLot ? "lot-mine" : "lot";
    const preview = TILE_TYPES[previewTileType as keyof typeof TILE_TYPES];

    // Lista, não campos soltos, pra "Informações do lote" crescer sem
    // reescrever o layout (valor, imposto, infraestrutura etc., quando a
    // economia de lotes existir).
    const infoRows: { label: string; value: string; loading?: boolean }[] = [
        { label: "Dono", value: ownerName, loading: isLoadingOwner },
        ...(typeLabel ? [{ label: "Tipo", value: typeLabel }] : []),
        { label: "Coordenadas", value: `${x}, ${y}` },
    ];

    return (
        <LuvModal isOpen={selection !== null} onClose={onClose} title="Inspecionar lote" size="medium">
            {selection && (
                <div className="d-grid grid-cols-2 gap">
                    <div className="d-flex flex-col gap">
                        <div className="card pixel flat p-0 d-flex items-center justify-center" style={{ aspectRatio: "1", overflow: "hidden" }}>
                            <Block texture={preview.texture} color={preview.color} size={160} />
                        </div>

                        <div className="d-flex flex-col gap-8">
                            <span className="text-bold text-size-18">Informações do Lote</span>
                            <div className="card flat pixel d-flex flex-col gap-16">
                                {infoRows.map((row) => (
                                    <div key={row.label} className="d-flex items-center justify-between gap">
                                        <span className="text-placeholder text-size-12">{row.label}</span>
                                        {row.loading ? <LuvSpinner size={16} /> : <span className="text-text text-size-12">{row.value}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="d-flex flex-col gap-8">
                        <span className="text-bold text-size-18">Vizinhança</span>

                        {isLoadingNeighborhood ? (
                            <LuvSpinner size={16} />
                        ) : neighborhood.length === 0 ? (
                            <span className="text-text text-size-12">Nada por perto ainda.</span>
                        ) : (
                            <div className="card pixel flat d-flex flex-col gap-8">
                                {neighborhood.map((item) => (
                                    <>
                                        <div key={item.id} className="d-flex items-center justify-between gap-8">
                                            <span className="d-flex items-center gap-4 text-text">
                                                <LuvIcon name={item.icon} size={16} />
                                                {item.label}
                                            </span>
                                            <span className="text-placeholder text-size-12">{item.distanceMinutes} min</span>
                                        </div>
                                        <LuvDivider></LuvDivider>
                                    </>
                                ))}
                            </div>
                        )}

                        <div className="card flat info p-8 mt-8">
                            <span className="text-text text-size-12"><strong>Dica:</strong> {tip}</span>
                        </div>
                    </div>
                </div>
            )}
        </LuvModal>
    );
}
