# Plano — Atividade evento

## Status

⏳ Pendente

## Objetivo técnico

Implementar evento reaproveitando 100% o mecanismo de atividade com prazo (`activityEndsAt`) que já existe desde a M01 — nenhuma mudança estrutural no motor de tick deveria ser necessária.

## Escopo

- Cada evento do catálogo (plano 01) vira um valor de `Activity` com `activityEndsAt` calculado na hora de entrar.
- Efeito do evento aplicado via o mesmo `applyActivityEffect`/`recomputeUntil` já existentes.
- Testes cobrindo o efeito de cada evento, incluindo o caso de trocar de atividade no meio do evento (prorata).

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts`

## Depende de

- Catálogo de eventos (plano 01).

## Referências

- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
