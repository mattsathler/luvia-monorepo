# Plano — Monorepo & Design System

## Status

✅ Concluído

## Objetivo técnico

Ter a base técnica compartilhada (workspaces, componentes visuais, ícones) pronta antes de qualquer feature de jogo depender dela.

## Escopo

- Monorepo com npm workspaces (`apps/*`, `packages/*`).
- `packages/luv-ui`: tokens de cor (claro/escuro), componentes (Button, Input, Modal, Stepper, Tabs, Snackbar, Checkbox, SlideToggle, DatePicker, componentes de cidade isométrica), helpers de layout em SCSS, build ESM (`dist/index.js` + `dist/index.css`).
- `packages/luv-icons`: SVGs próprios no estilo arredondado/chibi, sem exportar componente React (só o mapa `icons`), consumidos via `LuvIcon` do `luv-ui`.
- `apps/docs`: storybook interno pra visualizar os componentes do design system.

## Onde no código

- `packages/luv-ui/`
- `packages/luv-icons/`
- `apps/docs/`

## Depende de

Nenhuma.

## Referências

- [[../../../decisions/0007-nao-utilizar-tailwind]]
- [[../../../decisions/0008-luv-ui-como-design-system-obrigatorio]]
- [[../../../ui-ux/design-system]]
- [[../../../ui-ux/visual-art-style]]
