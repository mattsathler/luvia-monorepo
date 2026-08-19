# M04 — Fama & Eventos

## Objetivo

Dar à Fama um propósito real como indicador de progresso (ver [[../../game-design/progression-fame]]), e introduzir eventos como primeira atividade com prazo definido pelo sistema (ver [[../../game-design/events]]).

## Status

⏳ Planejada.

## Escopo

- **Eventos como atividade temporária**: pelo menos 1–2 tipos de evento (ex.: festa, feira — ver [[../../game-design/events]]) usando o mecanismo de `activityEndsAt` que já existe desde a M01 (evento é só mais uma `Activity` com prazo).
- **Efeito de evento**: participar aumenta Fama e/ou skills (relacionamentos ficam pra M05, mesmo que o game design já preveja o efeito — não há sistema de relacionamento ainda pra afetar).
- **Fama como progresso visível**: ranking simples ou marco de Fama exibido na UI (não existe "Level" — ver [[../../decisions/0003-fama-substitui-level]]).
- Catálogo de eventos: definição de quando/como um evento fica disponível (ex.: horário fixo, recorrente) — decisão de game design ainda em aberto, fechar aqui.

## Fora do escopo

- Eventos sazonais/especiais elaborados — só o suficiente pra validar o sistema.
- Efeito de evento sobre relacionamentos (M05 ainda não existe).
- Qualquer tipo de matchmaking ou "todo mundo no mesmo evento ao mesmo tempo" — Luvia não tem tempo real (ver [[../../decisions/0001-mmorpg-idle-social-sem-tempo-real]]).

## Estimativa

**1–2 semanas.** Tecnicamente é a milestone mais barata do meio do roadmap: eventos reaproveitam 100% da infraestrutura de atividade com prazo que já existe (`activityEndsAt`, recompute, prorata). O trabalho é catálogo de eventos + UI pra listar/participar + exibição de Fama.

## Referências

- [[../../game-design/events]]
- [[../../game-design/progression-fame]]
- [[../../decisions/0003-fama-substitui-level]]
- [[../../technical/simulation-tick]]
