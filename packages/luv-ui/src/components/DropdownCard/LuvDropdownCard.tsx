import { useState, type ReactNode } from "react";
import { LuvIcon } from "../Icon/LuvIcon";
import "./LuvDropdownCard.scss";

export type LuvDropdownCardProps = {
    title?: string;
    children: ReactNode;
    /** @default true */
    defaultOpen?: boolean;
    /** Classes do `.card` externo (ex.: padding, largura). */
    className?: string;
    /** Classes do wrapper do conteúdo em si (ex.: `d-grid grid-cols-2` pro layout interno) — separado de `className` porque esse recai sobre o cabeçalho + corpo juntos, não só o conteúdo. */
    bodyClassName?: string;
};

/**
 * Card com um botão de minimizar/expandir no cabeçalho — o corpo colapsa com
 * animação (`grid-template-rows` 1fr→0fr, anima até a altura real do
 * conteúdo sem precisar medir em JS). Pensado pras janelas da HUD do jogo
 * (ver apps/game/src/pages/home/hud/), mas genérico o bastante pra qualquer
 * card que precise dessa affordance.
 */
export function LuvDropdownCard({ title, children, defaultOpen = true, className, bodyClassName }: LuvDropdownCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={["card", "dropdown-card", "pointer-events-auto", className].filter(Boolean).join(" ")}>
            <div className="dropdown-card-header d-flex items-center justify-between gap-8">
                {title && <strong className="text-text">{title}</strong>}
                <button
                    type="button"
                    className="dropdown-card-toggle circle icon"
                    aria-label={isOpen ? "Minimizar" : "Expandir"}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((current) => !current)}
                >
                    <LuvIcon name="expand_more" />
                </button>
            </div>

            <div className={`dropdown-card-collapse ${isOpen ? "" : "dropdown-card-collapse--closed"}`}>
                {isOpen ?
                    <div className={["dropdown-card-body", "pt-16", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
                    : <></>
                }
            </div>
        </div >
    );
}
