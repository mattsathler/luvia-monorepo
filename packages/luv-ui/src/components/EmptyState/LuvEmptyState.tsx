import { LuvIcon } from "../Icon/LuvIcon";
import "./LuvEmptyState.scss";

export type LuvEmptyStateProps = {
    /** Nome do ícone (Material Symbols ou luv-icons) — ex.: "search_off". */
    icon: string;
    message: string;
    className?: string;
};

// Ocupa 100% da largura de onde for usado (ex.: dentro de uma lista de
// resultados de busca) — ícone pequeno + mensagem, centralizados.
export function LuvEmptyState({ icon, message, className }: LuvEmptyStateProps) {
    return (
        <div className={["empty-state", className].filter(Boolean).join(" ")}>
            <LuvIcon name={icon} size={24} className="text-placeholder" />
            <span className="text-placeholder text-size-12">{message}</span>
        </div>
    );
}
