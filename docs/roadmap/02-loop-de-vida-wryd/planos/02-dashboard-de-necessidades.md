# Plano — Dashboard de necessidades

## Status

⏳ Pendente

## Objetivo técnico

Substituir o placeholder de `HomePage` (hoje só nome do personagem + botão de sair) por uma tela que mostra o estado de verdade do personagem.

## Escopo

- Exibir felicidade, energia, dinheiro e fama (ver [[../../../game-design/character-needs]]) com algum indicador visual (barra/medidor), não só número cru.
- Layout preparado pra crescer: esta tela vira a "tela de vida" onde o seletor de atividade (plano 03) e, depois, os atalhos pra cidade (M03) e eventos (M05) vão morar.
- Estado de erro tratável (API fora do ar não deixa a tela em branco).

## Onde no código

- `apps/game/src/pages/home/HomePage.tsx`, `HomePage.controller.ts`

## Depende de

Nenhuma além do que a M01 já entrega (o `Character` já tem os quatro campos).

## Referências

- [[../../../game-design/character-needs]]
- [[../../../decisions/0022-paginas-separadas-em-controller-hook-e-view]]
