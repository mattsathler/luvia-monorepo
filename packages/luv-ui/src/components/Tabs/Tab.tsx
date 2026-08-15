import React from "react";

export type TabProps = {
    title: string;
    /** Chave de cor utilitária (ex.: "primary", "game-teal") aplicada de fundo quando a aba está ativa. */
    color?: string;
    children?: React.ReactNode;
};

export function Tab({ children }: TabProps) {
    return <div className="tab">{children}</div>;
}