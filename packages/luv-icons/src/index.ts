import body from "./svgs/body.svg?raw";
import face from "./svgs/face.svg?raw";
import hair from "./svgs/hair.svg?raw";
import shirt from "./svgs/shirt.svg?raw";
import blouse from "./svgs/blouse.svg?raw";
import overlay from "./svgs/overlay.svg?raw";
import pants from "./svgs/pants.svg?raw";
import shoes from "./svgs/shoes.svg?raw";
import male from "./svgs/male.svg?raw";
import female from "./svgs/female.svg?raw";
import heart from "./svgs/heart.svg?raw";

// Este pacote só guarda os SVGs (markup cru, 24x24, currentColor — ver
// diretriz de estilo em docs/ui-ux/visual-art-style.md). Não exporta
// componente React nenhum: quem renderiza é o LuvIcon (packages/luv-ui),
// que injeta o markup pelo nome via este mapa.
export const icons = {
    body,
    face,
    hair,
    shirt,
    blouse,
    overlay,
    pants,
    shoes,
    male,
    female,
    heart,
} satisfies Record<string, string>;

export type LuvIconName = keyof typeof icons;
