# Convenções de CSS

## Objetivo

Definir as regras de estilização do projeto.

## Decisões consolidadas

Utilizar SCSS. Evitar CSS inline. Evitar `!important`. Priorizar variáveis.

**Todo SCSS vive em `packages/luv-ui`.** É estritamente proibido criar arquivos `.scss` (ou CSS customizado de qualquer forma) em `apps/game`, `apps/docs` ou qualquer outra app — ver [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]].

## Referências

- [[../ui-ux/design-system]]
- [[tech-stack]]
- [[../decisions/0007-nao-utilizar-tailwind]]
- [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]]
