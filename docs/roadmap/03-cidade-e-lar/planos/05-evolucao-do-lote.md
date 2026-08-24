# Plano — Evolução do lote

## Status

⏳ Pendente

## Objetivo técnico

Este plano cobre a metade mecânica do catálogo de Tipo+Nível (ver [[../../../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]]): dar ao lote uma progressão funcional em até 10 níveis por Tipo — melhorias pré-definidas, não construção manual (ver [[../../../game-design/lots-and-construction]]) — e cada nível sobe junto com a aparência (plano 04), não como sistema separado.

## Escopo

- Catálogo fechado de até 10 níveis por Tipo residencial (nível 1→10, cada um com um requisito e um efeito — efeito exato é decisão de game design a fechar aqui; pode ficar vazio/só cosmético nesta milestone se nenhum sistema ainda consome o benefício).
- Campo de nível no `Lot` (backend), compartilhado com o Tipo do plano 04 — a dupla Tipo+Nível é a identidade completa do lote.
- Endpoint pra evoluir o lote.
- Refletir o nível atual na renderização do lote na cidade (junto com o Tipo — plano 04).

## Onde no código

- `apps/api/src/city/`
- `apps/game/src/pages/city/`

## Depende de

- Lote residencial do jogador (plano 03).

## Relacionado

- [[04-personalizacao-de-lote]] — mesmo catálogo de Tipo+Nível, metade visual.

## Referências

- [[../../../decisions/0032-lote-tipo-e-nivel-catalogo-expansivel]]
- [[../../../game-design/lots-and-construction]]
