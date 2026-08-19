type ThumbnailOptionProps = {
    /** Id numérico do item (nome da subpasta em assets/character/<categoria>/<id>/). Não é um nome — só identifica a opção. */
    id: string;
    /** Miniatura pré-recortada (ver `character-assets.ts`) — não é a peça em si. */
    previewSrc: string;
    isSelected: boolean;
    onSelect: () => void;
};

/** Botão de seleção que mostra só a miniatura do item, sem nome visível — ver ThumbnailOption no chamador. */
export function ThumbnailOption({ id, previewSrc, isSelected, onSelect }: ThumbnailOptionProps) {
    return (
        <button
            type="button"
            className={isSelected ? "game-cyan hidden min-h-full min-w-full border-16" : "outline hidden border min-h-full min-w-full border-16"}
            aria-pressed={isSelected}
            aria-label={id}
            onClick={onSelect}
        >
            <div className="d-flex h-full justify-center items-center">
                <img src={previewSrc} alt="" className="w-full h-128 object-contain p-24" />
            </div>
        </button>
    );
}
