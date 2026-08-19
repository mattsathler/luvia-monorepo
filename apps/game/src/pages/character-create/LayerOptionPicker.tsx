import { getLayerAssets } from "../../lib/character-assets";
import { ThumbnailOption } from "./ThumbnailOption";

type LayerOptionPickerProps = {
    category: string;
    selectedId: string;
    onSelect: (id: string) => void;
};

/** Não renderiza nada se a categoria ainda não tem nenhum PNG em assets/character. */
export function LayerOptionPicker({ category, selectedId, onSelect }: LayerOptionPickerProps) {
    const options = getLayerAssets(category);

    if (options.length === 0) {
        return null;
    }

    return (
        <div className="d-flex flex-col gap w-full hidden flex-1-1 min-h-0">
            <div className="d-grid grid-wrap-3 gap scroll-y flex-1-1 p-16 border-border border-16 h-320">
                {options.map((asset) => (
                    <div className="w-full">
                        <ThumbnailOption
                            key={asset.id}
                            id={asset.id}
                            imageSrc={asset.src}
                            isSelected={selectedId === asset.id}
                            onSelect={() => onSelect(asset.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
