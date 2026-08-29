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

// Barra de progresso pra status limitados (0..max), como felicidade e
// energia do personagem — ver docs/ui-ux (protótipo da janela de perfil).
export function LuvStatBar({ icon, label, value, max, color }: LuvStatBarProps) {
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
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
            <div className="luv-stat-bar-track">
                <div className="luv-stat-bar-fill" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
