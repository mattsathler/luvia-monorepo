# Plano — Efeito de evento compartilhado

## Status

⏳ Pendente

## Objetivo técnico

Fecha a lacuna deixada intencionalmente aberta na M04: participar do mesmo evento que outro jogador passa a afetar o relacionamento entre os dois, não só a Fama/skills de cada um isoladamente.

## Escopo

- Ao recomputar um evento, verificar quem mais participou no mesmo intervalo e aplicar efeito sobre o relacionamento entre os presentes.
- Efeito proporcional ao tempo compartilhado no evento, não binário (estar 1 minuto junto não deveria valer o mesmo que o evento inteiro).

## Onde no código

- `apps/api/src/relationship/`
- `apps/api/src/character/` (ponto de recompute do evento, M04)

## Depende de

- Bounded context de relacionamento (plano 01).
- Atividade evento (M04, plano 02).

## Referências

- [[../../../game-design/events]]
- [[../../../game-design/relationships]]
