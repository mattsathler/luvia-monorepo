# Plano — Evolução do lote

## Status

⏳ Pendente

## Objetivo técnico

Dar ao lote uma progressão funcional simples — melhorias pré-definidas, não construção manual (ver [[../../../game-design/lots-and-construction]]).

## Escopo

- Catálogo fechado de níveis/melhorias pro lote residencial (ex.: nível 1→2→3, cada um com um requisito e um efeito — efeito exato é decisão de game design a fechar aqui; pode ficar vazio/só cosmético nesta milestone se nenhum sistema ainda consome o benefício).
- Endpoint pra evoluir o lote.
- Refletir o nível atual na renderização do lote na cidade.

## Onde no código

- `apps/api/src/lot/`
- `apps/game/src/pages/city/`

## Depende de

- Lote residencial do jogador (plano 03).

## Referências

- [[../../../game-design/lots-and-construction]]
