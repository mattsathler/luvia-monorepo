# 0008 — Luv.UI é o design system obrigatório

## Contexto

Era necessário evitar duplicação de estilos e componentes visuais entre `apps/game` e `apps/docs`.

## Decisão

Existe um Design System chamado Luv.UI (`packages/luv-ui`). Todo componente visual deve pertencer ao Luv.UI.

## Justificativa

Evita CSS repetido e mantém consistência visual entre as aplicações do monorepo.

## Consequências

- Não criar componentes visuais fora de `packages/luv-ui` para uso compartilhado.
- Novos componentes de UI devem ser adicionados ao Luv.UI antes de serem consumidos pelas apps.

## Referências

- [[../ui-ux/design-system]]
- [[../technical/tech-stack]]
