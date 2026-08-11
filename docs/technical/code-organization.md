# Organização de Código

## Objetivo

Definir como o código deve ser organizado.

## Decisões consolidadas

Cada feature deve ser independente. Evitar arquivos gigantes.

Priorizar:

- composição
- reutilização
- baixo acoplamento

## Páginas: controller hook + view

Páginas de `apps/game/src/pages/**` separam lógica de apresentação: `<Page>.controller.ts` concentra `useState`/`useEffect`/handlers num hook `use<Page>Controller`, e `<Page>.tsx` só monta o JSX a partir do retorno desse hook. Ver [[../decisions/0022-paginas-separadas-em-controller-hook-e-view]].

## Referências

- [[tech-stack]]
- [[code-philosophy]]
- [[../decisions/0022-paginas-separadas-em-controller-hook-e-view]]
