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
            className={isSelected ? "game-cyan hidden max-h-none w-full border-16" : "outline hidden border max-h-none w-full border-16"}
            aria-pressed={isSelected}
            aria-label={id}
            onClick={onSelect}
        >
            <div className="d-flex h-full justify-center items-center">
                <img src={displaySrc} alt="" className="w-full max-h-128 object-contain" />
            </div>
        </button>
    );
}
