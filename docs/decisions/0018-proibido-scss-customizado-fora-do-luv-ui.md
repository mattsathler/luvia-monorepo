# 0018 — Proibido SCSS customizado fora do Luv.UI

## Contexto

Os documentos [[../ui-ux/design-system]] e [[../technical/css-conventions]] já diziam "todo componente visual deve pertencer ao Luv.UI" e "utilizar SCSS", mas não deixavam explícito que **nenhum outro lugar do monorepo pode escrever SCSS próprio**.

## Decisão

É **estritamente proibido** criar arquivos `.scss` (ou qualquer CSS customizado) fora de `packages/luv-ui`. Todo estilo usado por `apps/game`, `apps/docs` ou qualquer app futura vem das classes e componentes já existentes no Luv.UI.

## Justificativa

Evita duplicação de estilos e drift visual entre apps — se uma tela precisa de um estilo que o Luv.UI não tem, a resposta é adicionar esse estilo/componente ao Luv.UI, não criar um SCSS local.

## Consequências

- Apps consumidoras (`apps/game`, `apps/docs`) nunca devem ter arquivos `.scss` próprios — apenas usar classes exportadas por `luv-ui/styles.css` e os componentes React do pacote.
- Se uma necessidade visual não é atendida pelo Luv.UI, a solução correta é evoluir o Luv.UI (novo componente/classe), não criar CSS ad-hoc na app.
- CSS inline (`style={{...}}`) continua proibido, conforme já registrado em [[../technical/css-conventions]].

## Referências

- [[../ui-ux/design-system]]
- [[../technical/css-conventions]]
- [[0007-nao-utilizar-tailwind]]
