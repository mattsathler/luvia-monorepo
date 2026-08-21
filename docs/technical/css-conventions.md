# Convenções de CSS

## Objetivo

Definir as regras de estilização do projeto.

## Decisões consolidadas

Utilizar SCSS. Evitar CSS inline. Evitar `!important`. Priorizar variáveis.

**Todo SCSS vive em `packages/luv-ui`.** É estritamente proibido criar arquivos `.scss` (ou CSS customizado de qualquer forma) em `apps/game`, `apps/docs` ou qualquer outra app — ver [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]].

### Classes helper e o modificador `--force`

As classes helper de `packages/luv-ui/src/styles/_helpers.scss` (`.d-flex`, `.m-16`, `.hidden`, etc.) já usam `!important` na maioria — é o que permite compor uma tela só com classes utilitárias e ainda vencer o CSS de escopo de um componente carregado depois no bundle, sem depender de ordem de import. Isso é a exceção deliberada à regra geral de evitar `!important` (que vale pro CSS específico de componente, não pros helpers).

Toda classe helper que hoje **não** tem `!important` (ex.: `.hidden`, `.scroll-auto`, `.min-h-full`, `.gap-16`, `.cursor-normal`) tem uma variante irmã com o sufixo `--force` (`.hidden--force`, `.scroll-auto--force`, `.min-h-full--force`, `.gap-16--force`, `.cursor-normal--force`, ...) que aplica a mesma regra com `!important`. Usar a variante `--force` só quando a versão normal não for suficiente pra vencer um CSS de componente com a mesma especificidade — não usar por padrão.

Classe helper nova: se a propriedade puder colidir com CSS de componente (a maioria), já nasce com `!important`; senão, considerar se vale a pena ter uma variante `--force` também.

## Referências

- [[../ui-ux/design-system]]
- [[tech-stack]]
- [[../decisions/0007-nao-utilizar-tailwind]]
- [[../decisions/0018-proibido-scss-customizado-fora-do-luv-ui]]
