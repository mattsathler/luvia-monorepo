import { useState, type ReactNode } from "react";
import { LuvIcon } from "../Icon/LuvIcon";
import "./LuvExpandableBox.scss";

export type LuvExpandableBoxOrigin = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";

export type LuvExpandableBoxProps = {
    /** Conteúdo sempre visível, clicável pra abrir/fechar (ex.: o rosto do personagem) — fica ancorado no canto de `origin` tanto fechado quanto aberto. */
    trigger: ReactNode;
    /** Rótulo acessível do botão-gatilho — obrigatório porque `trigger` pode ser só uma imagem/div sem texto próprio. */
    triggerLabel: string;
    /** Conteúdo que só aparece quando aberto (ex.: o restante das informações do perfil). */
    children: ReactNode;
    /**
     * Ponto onde `trigger` fica ancorado — a caixa cresce a partir dele ao
     * abrir (e encolhe de volta pra ele ao fechar). Os 4 cantos crescem pros
     * dois lados opostos ao canto; `"bottom-center"` fica preso na base e
     * centralizado horizontalmente, crescendo pra cima e pros dois lados ao
     * mesmo tempo — pensado pra janelas que ficam na parte de baixo da tela.
     * @default "top-left"
     */
    origin?: LuvExpandableBoxOrigin;
    /** @default false */
    defaultOpen?: boolean;
    /** Classes da superfície `.card` (ex.: `d-flex gap-8` pra colocar trigger e conteúdo lado a lado). */
    className?: string;
    /**
     * Classes do wrapper do conteúdo colapsável. Se `children` tiver algum
     * descendente com largura em % (ex.: `LuvStatBar`), inclua aqui uma
     * largura explícita (ex.: `w-164`) — sem isso, a largura intrínseca do
     * conteúdo mede 0 (% não tem base pra resolver) e só a altura anima (ver
     * `LuvExpandableBox.scss`).
     */
    bodyClassName?: string;
};

/**
 * Caixa cujo "fechado" é qualquer `trigger` que o consumidor passar (não um
 * ícone fixo, como em `LuvDropdownCard`) — clicar nele revela `children` ao
 * redor, crescendo em largura e altura a partir do canto de `origin` até
 * ocupar o espaço da caixa aberta (ver `LuvExpandableBox.scss`: mesmo truque
 * de grid `1fr`→`0fr` do `LuvDropdownCard`, só que nos dois eixos).
 */
export function LuvExpandableBox({
    trigger,
    triggerLabel,
    children,
    origin = "top-left",
    defaultOpen = false,
    className,
    bodyClassName,
}: LuvExpandableBoxProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`expandable-box expandable-box--origin-${origin}`}>
            <div
                className={[
                    "expandable-box-surface",
                    isOpen ? "expandable-box-surface--open" : "",
                    "pointer-events-auto",
                    className,
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <button
                    type="button"
                    className="expandable-box-trigger"
                    aria-label={triggerLabel}
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((current) => !current)}
                >
                    {trigger}
                </button>

                <div className={`expandable-box-collapse ${isOpen ? "" : "expandable-box-collapse--closed"}`}>
                    {isOpen ? (
                        <div className={["expandable-box-body", bodyClassName].filter(Boolean).join(" ")}>{children}</div>
                    ) : (
                        <></>
                    )}
                </div>

                {isOpen && (
                    <button
                        type="button"
                        className="expandable-box-close circle icon"
                        aria-label="Fechar"
                        onClick={() => setIsOpen(false)}
                    >
                        <LuvIcon name="minimize" size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}
