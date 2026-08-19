# Plano — Lote residencial do jogador

## Status

⏳ Pendente

## Objetivo técnico

Todo personagem passa a ter um lugar físico na cidade — o lote residencial — sem precisar de nenhuma ação manual de "comprar terreno" (decisão de produto: reivindicação automática, não mercado imobiliário).

## Escopo

- Ao criar/selecionar personagem sem lote residencial ainda, o backend atribui um automaticamente (posição livre na grade).
- Frontend: destaque visual do lote do próprio jogador na tela de cidade (plano 01).
- Atalho pra ir do dashboard (M02) direto pro próprio lote.

## Onde no código

- `apps/api/src/lot/` (plano 02)
- `apps/game/src/pages/city/`

## Depende de

- Bounded context de lote (plano 02).
- Cidade isométrica no jogo (plano 01).

## Referências

- [[../../../game-design/city-and-world]]
- [[../../../game-design/lots-and-construction]]
