import { LuvDivider, LuvEmptyState, LuvExpandableBox, LuvIcon, LuvInput, LuvSpinner } from "luv-ui";
import { useMapSearchPanelController } from "./MapSearchPanel.controller";

// Forma rápida de navegação do jogador: busca lotes da cidade (dono ou tipo)
// pra empregos, compra, visitas etc. — ver docs/game-design e
// SearchLotsUseCase na API.
export function MapSearchPanel() {
    const { query, setQuery, results, isLoading, handleSelectLot } = useMapSearchPanelController();

    return (
        <LuvExpandableBox
            trigger={
                <div className="d-flex items-center justify-center gap-4 text-text">
                    <LuvIcon name="map" size={36} className="text-game-blue" />
                </div>
            }
            triggerLabel="Buscar lotes"
            origin="bottom-left"
            className="border-16 card p-16"
            bodyClassName="w-276 d-flex flex-col gap-8 pointer-events-auto pr-24"
        >
            <LuvInput
                placeholder="Buscar lote"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <div className="d-flex flex-col gap-4 scroll-y h-164 pr-16">
                {isLoading && <LuvSpinner label="Buscando..." size={16} />}

                {!isLoading && results.length === 0 && (
                    <LuvEmptyState icon="search_off" message="Nenhum lote encontrado." />
                )}

                {!isLoading &&
                    results.map((lot) => (
                        <button
                            key={lot.lotId}
                            type="button"
                            className="outline border-placeholder--force d-flex justify-start gap-16 w-full text-left"
                            onClick={() => handleSelectLot(lot)}
                        >
                            <LuvIcon name="home" size={24} className="text-placeholder" />
                            <LuvDivider orientation="vertical" className="bg-placeholder"></LuvDivider>
                            <div className="d-flex flex-col items-start">
                                <span>{lot.ownerName || lot.typeName}</span>
                                <span className="text-placeholder text-size-12">
                                    {lot.typeName} · ({lot.x}, {lot.y})
                                </span>
                            </div>
                        </button>
                    ))}
            </div>
        </LuvExpandableBox>
    );
}
