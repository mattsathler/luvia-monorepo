import { useTrimmedImage } from "../../lib/useTrimmedImage";

type ThumbnailOptionProps = {
    /** Id numérico do item (nome do arquivo em assets/character/<categoria>/<id>.png). Não é um nome — só identifica a opção. */
    id: string;
    imageSrc: string;
    isSelected: boolean;
    onSelect: () => void;
    /** Desliga o recorte de blank area para imagens que já nascem justas. */
    trim?: boolean;
};

/** Botão de seleção que mostra só o PNG do item, sem nome visível — ver ThumbnailOption no chamador. */
export function ThumbnailOption({ id, imageSrc, isSelected, onSelect, trim = true }: ThumbnailOptionProps) {
    const displaySrc = useTrimmedImage(imageSrc, trim);

    return (
        <button
            type="button"
            className={isSelected ? "primary hidden" : "outline primary hidden"}
            aria-pressed={isSelected}
            aria-label={id}
            onClick={onSelect}
        >
            <div className="d-flex w-48 h-48 justify-center">
                <img src={displaySrc} alt="" className="w-100-p" />
            </div>
        </button>
    );
}
