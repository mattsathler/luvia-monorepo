/**
 * Ver docs/decisions/0019-personagem-montado-em-camadas-com-rig-2d.md.
 * Tom de pele é restrito a uma escala fixa de 0 (mais claro) a 6 (mais
 * escuro), paleta suave/cozy (ver docs/ui-ux/visual-art-style.md); as demais
 * peças são ids livres de asset, validados na camada de apresentação, não aqui.
 */
export const SKIN_TONES = [0, 1, 2, 3, 4, 5, 6] as const;
export type SkinTone = (typeof SKIN_TONES)[number];

export type Appearance = {
  skinTone: SkinTone;
  /** Escolhido na criação do personagem; id de asset livre (catálogo de estilos de cabelo). */
  hairType: string;
  /** Escolhido na criação do personagem; id de asset livre (catálogo de tipos de olho). */
  eyeType: string;
  face: string;
  /** Restrito à cabeça (chapéu, óculos, etc). `null` = nenhum acessório equipado. */
  accessory: string | null;
  top: string;
  pants: string;
  shoes: string;
};

export const DEFAULT_APPEARANCE: Appearance = {
  skinTone: 3,
  hairType: 'default',
  eyeType: 'default',
  face: 'default',
  accessory: null,
  top: 'default',
  pants: 'default',
  shoes: 'default',
};
