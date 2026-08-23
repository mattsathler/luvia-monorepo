# Plano — Motor de Simulação WRYD (backend)

## Status

✅ Concluído — sem nenhuma UI no frontend ainda (ver [[../../02-loop-de-vida-wryd/descricao]]).

## Objetivo técnico

Ter o mecanismo que faz o tempo passar sobre o estado do personagem, sem depender de conexão em tempo real nem de processar todos os personagens de uma vez.

## Escopo

- `Activity` (`idle` | `working`) com taxa de efeito por minuto sobre `happiness`/`energy`/`money`/`fame`.
- `Character.recomputeUntil(now)`: aplica o efeito da atividade atual sobre `[lastUpdatedAt, now]`; se `activityEndsAt` cair no meio do intervalo, fecha a atividade até lá e trata o resto como `idle`.
- `RecomputeCharacterUseCase`: recompute individual sob demanda (lazy), com escrita condicionada ao `lastUpdatedAt` antigo (`trySave`) pra evitar corrida com o tick em lote.
- `ChangeActivityUseCase`: recomputa a atividade anterior antes de gravar a nova (prorata).
- `CharacterTickScheduler`: roda em intervalo configurável (`TICK_INTERVAL_MS`), processa personagens desatualizados em lotes (`TICK_BATCH_SIZE`, `TICK_MAX_BATCHES_PER_RUN`).
- Endpoint `POST /characters/:id/activity`.

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts`, `character.entity.ts`
- `apps/api/src/character/application/use-cases/recompute-character.use-case.ts`, `change-activity.use-case.ts`
- `apps/api/src/character/infrastructure/scheduling/character-tick.scheduler.ts`

## Depende de

- Criação de Personagem (plano 03).

## Referências

- [[../../../decisions/0013-sistema-wryd-tick-em-lotes-e-polling]]
- [[../../../technical/simulation-tick]]
- [[../../../game-design/wryd-activity-system]]
