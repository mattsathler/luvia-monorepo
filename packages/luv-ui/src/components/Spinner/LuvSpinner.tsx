import type { CSSProperties } from "react";
import { LuvIcon } from "../Icon/LuvIcon";
import "./LuvSpinner.scss";

export type LuvSpinnerProps = {
    /** Rótulo acessível (`aria-label`) — se dado, também aparece como texto ao lado do ícone. */
    label?: string;
    /** @default 24 */
    size?: number;
    /** Chave de cor utilitária (ex.: "primary", "game-blue") — sem isso, usa --text. */
    color?: string;
    className?: string;
};

// Ícone giratório (Material Symbols "progress_activity", já desenhado como
// spinner) — substitui os placeholders de texto puro ("Carregando...") que
// existiam espalhados pelo app.
export function LuvSpinner({ label, size = 24, color, className }: LuvSpinnerProps) {
    const style = color ? ({ "--luv-spinner-color": `var(--${color})` } as CSSProperties) : undefined;

    return (
        <div
            className={["luv-spinner", className].filter(Boolean).join(" ")}
            role="status"
            aria-label={label ?? "Carregando"}
            style={style}
        >
            <LuvIcon name="progress_activity" size={size} className="luv-spinner-icon" />
            {label && <span className="text-text">{label}</span>}
        </div>
    );
}
