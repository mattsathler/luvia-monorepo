# Plano — Indicador de Fama

## Status

⏳ Pendente — parcialmente coberto pelo plano 02: Fama já aparece em `ProfilePanel.tsx`, mas hoje lado a lado com dinheiro, como mais um número com ícone — sem o destaque visual próprio de "indicador de progresso" que este plano pede.

## Objetivo técnico

Deixar a Fama visível como o indicador de progresso do jogo, evitando qualquer terminologia de "Level" (ver [[../../../decisions/0003-fama-substitui-level]]).

## Escopo

- Exibir Fama no dashboard (plano 02), com destaque visual proporcional à sua função de "indicador de progresso" (não é só mais um número ao lado dos outros três).
- Nenhuma fonte de Fama além do valor inicial existe ainda nesta milestone — o indicador é preparado pra crescer a partir da M05 (eventos), sem ficar "morto" visualmente enquanto isso.

## Onde no código

- `apps/game/src/pages/home/`

## Depende de

- Dashboard de necessidades (plano 02).

## Referências

- [[../../../game-design/progression-fame]]
- [[../../../decisions/0003-fama-substitui-level]]
