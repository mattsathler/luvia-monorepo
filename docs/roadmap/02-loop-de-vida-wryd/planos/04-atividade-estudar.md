# Plano — Atividade "Estudar"

## Status

⏳ Pendente

## Objetivo técnico

Primeira atividade nova desde a M01 — valida que o motor de simulação (feito genérico de propósito) realmente suporta adicionar atividade sem mexer no núcleo do tick.

## Escopo

- Adicionar `'studying'` a `Activity` (`apps/api/.../activity.ts`).
- Taxa de efeito: aumenta pontos de uma skill específica ao longo do tempo (diferente de `resting`/`working`, que afetam campos fixos de `CharacterStats` — estudar precisa saber *qual* skill, então `Character.changeActivity`/`recomputeUntil` precisam carregar esse contexto, ex.: `activityTarget` ou campo equivalente).
- `ChangeActivityDto` aceita a skill alvo quando `activity === 'studying'`, validada contra o catálogo (`SKILL_IDS`).
- Testes cobrindo o novo efeito, incluindo o caso de prorata (trocar de "Estudar" pra outra atividade no meio do intervalo).

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts`, `character.entity.ts`, `skill.ts`
- `apps/api/src/character/presentation/dto/change-activity.dto.ts`

## Depende de

Nenhuma (o catálogo de skills provisório da M01 já é suficiente pra implementar o mecanismo — balanceamento fica pro plano 07 da M01 / M08).

## Referências

- [[../../../game-design/skills-and-study]]
- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
- [[../../01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]
