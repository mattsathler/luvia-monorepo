# Design System (Luv.UI)

## Objetivo

Definir as regras do design system visual do projeto.

## Contexto

O design system vive no pacote `packages/luv-ui` do monorepo.

## Decisões consolidadas

Existe um Design System chamado **Luv.UI**.

Todo componente visual deve pertencer ao Luv.UI. Evitar CSS repetido. Nenhuma app consumidora (`apps/game`, `apps/docs`) pode ter SCSS próprio — ver [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]].

### Temas de cor

O Luv.UI define tokens de cor via CSS custom properties, com tema claro (padrão) e escuro, expostos em `packages/luv-ui/src/styles/_colors.scss`:

| Token | Light | Dark |
| --- | --- | --- |
| theme | `#ff8fc1` | `#FF7FB8` |
| primary | `#fbcbe2` | `#FF7FB8` |
| primary-text | `#ff519f` | `#FF6FAF` |
| secondary | `#afe2ff` | `#7ED4FF` |
| secondary-text | `#206b96` | `#206b96` |
| background | `#FFF7FB` | `#1A1418` |
| surface | `#FFFFFF` | `#241C21` |
| placeholder | `#C9B8C3` | `#7A6A74` |
| text | `#4A3A44` | `#F4EAF0` |
| success | `#6BE3A1` | `#5FD89A` |
| warn | `#FFC86B` | `#FFB85C` |
| error | `#FF6B7A` | `#FF7A88` |
| info | `#6EC9FF` | `#7ED4FF` |
| border | `#562974` | `#150b1c` |

O tema escuro é ativado via `[data-theme="dark"]` na raiz do documento.

### Ícones

Ícones vivem num pacote separado, `packages/luv-icons` (não faz parte do Luv.UI, mas segue o mesmo formato de workspace — `exports`, build ESM com `.d.ts`). Diferente do `luv-ui`, esse pacote não exporta componente React nenhum: só guarda SVGs crus (markup, não `.tsx`) num mapa `icons: Record<string, string>`. Só o Luv.UI depende dele diretamente — as apps nunca importam `luv-icons`, sempre passam pelo `LuvIcon` (`packages/luv-ui/src/components/Icon/LuvIcon.tsx`), que tenta `name` contra esse mapa e injeta o SVG; se não achar, cai para o Material Icons (ligadura de fonte) — assim um nome só (`<LuvIcon name="body" />`) cobre tanto os ícones próprios quanto os do Material Icons, sem a app precisar saber de qual pacote cada um vem. A diretriz de estilo visual dos ícones (arredondado, cute, chibi, no modelo do personagem) está documentada em [[visual-art-style]].

## Referências

- [[interface-principles]]
- [[visual-art-style]]
- [[../technical/tech-stack]]
- [[../technical/css-conventions]]
- [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]]
