# Plano — Lotes comercial e industrial

## Status

⏳ Pendente

## Objetivo técnico

Completar o bounded context de lote (M03) com os dois tipos que ficaram de fora até aqui.

## Escopo

- Estender `Lot` pra aceitar tipo `commercial`/`industrial`, reaproveitando a mesma regra de "1 de cada tipo por jogador" já genérica desde a M03 (ver [[../../03-cidade-e-lar/planos/02-bounded-context-de-lote]]).
- Personalização e evolução (M03, planos 04/05) estendidas pros novos tipos, mesmo que com catálogos visuais diferentes.
- Reivindicação: diferente do residencial (atribuído automaticamente), lote comercial/industrial provavelmente exige uma ação explícita do jogador (abrir uma empresa) — decidir e implementar junto do plano 02.

## Onde no código

- `apps/api/src/lot/`

## Depende de

- Bounded context de lote (M03, plano 02).

## Referências

- [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../03-cidade-e-lar/planos/02-bounded-context-de-lote]]
