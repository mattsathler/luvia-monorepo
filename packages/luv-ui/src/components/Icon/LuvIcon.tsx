import type { HTMLAttributes } from "react";
import { icons } from "luv-icons";

export type LuvIconProps = HTMLAttributes<HTMLSpanElement> & {
    name: string;
    size?: number;
};

// Ícone puramente decorativo por padrão (aria-hidden) — quando um ícone é o
// único conteúdo de um botão/link, o nome acessível deve vir de um
// aria-label no elemento que o envolve, não daqui.
//
// `name` primeiro tenta bater com um SVG do luv-icons (nossos ícones
// próprios, injetados via dangerouslySetInnerHTML); se não achar, cai pro
// Material Icons (ligadura de texto via fonte), pra nomes como
// "arrow_back_ios_new" que não têm equivalente no luv-icons.
export function LuvIcon({ name, className, size, ...rest }: LuvIconProps) {
    const svg = (icons as Record<string, string>)[name];

    if (svg) {
        return (
            <span
                className={["luv-icon", "luv-icon-svg", className].filter(Boolean).join(" ")}
                aria-hidden="true"
                style={{ width: size ?? 24, height: size ?? 24 }}
                dangerouslySetInnerHTML={{ __html: svg }}
                {...rest}
            />
        );
    }

    return (
        <span className={["material-icons", "luv-icon", className].filter(Boolean).join(" ")} aria-hidden="true" style={{ fontSize: size }} {...rest}>
            {name}
        </span>
    );
}
