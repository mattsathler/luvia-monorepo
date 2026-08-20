import type { HTMLAttributes } from "react";
import "./Divider.scss";

export type LuvDividerOrientation = "horizontal" | "vertical";

export type LuvDividerProps = HTMLAttributes<HTMLHRElement> & {
    orientation?: LuvDividerOrientation;
};

// Linha fina pra separar seções de UI — horizontal ocupa a largura do pai,
// vertical se estica pra altura do pai (precisa de um container flex/grid
// com altura definida pra ter efeito).
export function LuvDivider({ orientation = "horizontal", className, ...rest }: LuvDividerProps) {
    return (
        <hr
            className={["luv-divider", orientation, className].filter(Boolean).join(" ")}
            aria-orientation={orientation}
            {...rest}
        />
    );
}
