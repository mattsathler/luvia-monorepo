import { getLayerAssets } from "../../lib/character-assets";
import { ThumbnailOption } from "./ThumbnailOption";

type LayerOptionPickerProps = {
    category: string;
    label: string;
    selectedId: string;
    onSelect: (id: string) => void;
};

/** Não renderiza nada se a categoria ainda não tem nenhum PNG em assets/character. */
export function LayerOptionPicker({ category, label, selectedId, onSelect }: LayerOptionPickerProps) {
    const options = getLayerAssets(category);

    if (options.length === 0) {
        return null;
    }

    return (
        <div className="d-flex flex-col gap w-full hidden flex-1-1 min-h-0">
            <div className="card d-flex justify-center flat game-teal">
                <span className="text-size-20 text-text">{label}</span>
            </div>
            <div className="d-grid grid-cols-4 gap scroll-y flex-1-1 min-h-0">
                {options.map((asset) => (
                    <ThumbnailOption
                        key={asset.id}
                        id={asset.id}
                        imageSrc={asset.src}
                        isSelected={selectedId === asset.id}
                        onSelect={() => onSelect(asset.id)}
                    />
                ))}
            </div>
        </div>
    );
}
