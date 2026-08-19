# Plano — Skills: catálogo e balanceamento

## Status

⏳ Pendente — único plano em aberto desta milestone (ver nota em [[../descricao]]).

## Objetivo técnico

O mecanismo de distribuição de pontos na criação funciona, mas o catálogo de skills em si é um placeholder de game design, não uma decisão fechada.

## Escopo

- `SKILL_DEFINITIONS` hoje é uma lista fixa e provisória (`intelligence`, `charisma`, `creativity`, `strength`) — revisar contra o game design real (que empregos/produções cada skill deve destravar, ver [[../../../game-design/skills-and-study]] e [[../../../game-design/jobs]]) antes de tratar como catálogo final.
- `INITIAL_SKILL_POINTS_BUDGET` (hoje `4`) é um valor arbitrário — balancear depois que existir algo pra gastar skill (M02 em diante).
- Definir se o catálogo pode crescer depois do lançamento sem migração (hoje `skills` já é um mapa livre `id -> pontos`, então tecnicamente sim — só falta a decisão de produto).

## Onde no código

- `apps/api/src/character/domain/entities/skill.ts`

## Depende de

Nenhuma pra começar, mas o balanceamento de verdade só faz sentido depois que a atividade "Estudar" (M02) e os empregos existirem — ver [[../../02-loop-de-vida-wryd/planos/04-atividade-estudar]] e [[../../07-polimento-e-lancamento/planos/03-balanceamento-de-taxas]].

## Referências

- [[../../../game-design/skills-and-study]]
- [[../../../game-design/jobs]]
