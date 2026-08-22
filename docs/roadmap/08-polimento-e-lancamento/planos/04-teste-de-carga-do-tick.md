# Plano — Teste de carga do tick

## Status

⏳ Pendente

## Objetivo técnico

Validar que `CharacterTickScheduler` (M01, plano 06) aguenta o volume de personagens que o lançamento espera, sem atrasar — hoje `TICK_BATCH_SIZE`/`TICK_MAX_BATCHES_PER_RUN`/`TICK_INTERVAL_MS` são valores placeholder nunca testados sob carga real.

## Escopo

- Definir a meta de volume de personagens simultâneos pro lançamento.
- Popular um ambiente de teste com esse volume (personagens sintéticos) e medir o tempo de um ciclo completo de tick.
- Ajustar `TICK_BATCH_SIZE`/`TICK_MAX_BATCHES_PER_RUN`/`TICK_INTERVAL_MS` com base no resultado, não no chute original.
- Fechar as decisões marcadas "Pendente" em [[../../../technical/simulation-tick]].

## Onde no código

- `apps/api/src/character/infrastructure/scheduling/character-tick.scheduler.ts`

## Depende de

- Motor de simulação WRYD (M01, plano 06).

## Referências

- [[../../../technical/simulation-tick]]
- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
