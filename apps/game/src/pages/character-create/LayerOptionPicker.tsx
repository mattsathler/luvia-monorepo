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
        <div className="d-flex flex-col gap-8 w-full">
            <span className="text-size-16 text-text text-bold">{label}</span>
            <div className="d-flex flex-wrap gap-8">
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
