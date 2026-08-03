# 0007 — Não utilizar Tailwind

## Contexto

Era necessário escolher a abordagem de estilização do monorepo.

## Decisão

O projeto utiliza SCSS. Tailwind não deve ser utilizado.

## Justificativa

O projeto mantém um design system próprio (Luv.UI) baseado em variáveis SCSS; a decisão consolida essa abordagem como padrão único, evitando duas convenções de estilização convivendo no mesmo monorepo.

## Consequências

- Nenhuma dependência ou classe utilitária do Tailwind deve ser introduzida.
- Estilos novos devem seguir SCSS com variáveis, evitando CSS inline e `!important`.

## Referências

- [[../technical/tech-stack]]
- [[../technical/css-conventions]]
- [[../ui-ux/design-system]]
