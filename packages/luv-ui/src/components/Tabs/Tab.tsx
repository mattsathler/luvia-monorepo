import React from "react";

export type TabProps = {
    title: string;
    /** Ícone exibido no botão da aba no lugar do texto de `title` (ex.: `<BodyIcon />` do luv-icons). `title` continua sendo o identificador da aba e vira o `aria-label` do botão. */
    icon?: React.ReactNode;
    /** Chave de cor utilitária (ex.: "primary", "game-teal") aplicada de fundo quando a aba está ativa. */
    color?: string;
    children?: React.ReactNode;
};

export function Tab({ children }: TabProps) {
    return <div className="tab h-full">{children}</div>;
}