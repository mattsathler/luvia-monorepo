import type { HTMLAttributes } from "react";

export type LuvIconProps = HTMLAttributes<HTMLSpanElement> & {
    name: string;
};

// Ícone puramente decorativo por padrão (aria-hidden) — quando um ícone é o
// único conteúdo de um botão/link, o nome acessível deve vir de um
// aria-label no elemento que o envolve, não daqui.
export function LuvIcon({ name, className, ...rest }: LuvIconProps) {
    return (
        <span className={["material-icons", "luv-icon", className].filter(Boolean).join(" ")} aria-hidden="true" {...rest}>
            {name}
        </span>
    );
}
