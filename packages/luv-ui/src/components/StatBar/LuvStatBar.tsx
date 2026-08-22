import type { CSSProperties } from "react";
import "./StatBar.scss";
import { LuvIcon } from "../Icon/LuvIcon";

export type LuvStatBarProps = {
    icon: string;
    label: string;
    value: number;
    max: number;
    // Chave de $color-keys em _colors.scss (ex.: "game-green", "success") — sem isso, usa --theme.
    color?: string;
};

const DOT_COUNT = 10;

// Status limitados (0..max), como felicidade e energia do personagem, viram
// 10 bolinhas (uma por 10% do total) em vez de uma barra contínua — ver
// docs/ui-ux (protótipo da janela de perfil).
export function LuvStatBar({ icon, label, value, max, color }: LuvStatBarProps) {
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
    const filledDots = Math.round(ratio * DOT_COUNT);
    const style = color ? ({ "--luv-stat-bar-color": `var(--${color})` } as CSSProperties) : undefined;

    return (
        <div className="luv-stat-bar" style={style}>
            <div className="luv-stat-bar-header">
                <span className="luv-stat-bar-label">
                    <LuvIcon name={icon} size={16} />
                    {label}
                </span>
                <span className="luv-stat-bar-value">
                    {value}/{max}
                </span>
            </div>
            <div className="luv-stat-bar-dots">
                {Array.from({ length: DOT_COUNT }, (_, index) => (
                    <span
                        key={index}
                        className={`luv-stat-bar-dot${index < filledDots ? " luv-stat-bar-dot--filled" : ""}`}
                    />
                ))}
            </div>
        </div>
    );
}
