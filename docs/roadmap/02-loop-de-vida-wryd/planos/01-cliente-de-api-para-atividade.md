# Plano — Cliente de API para atividade

## Status

⏳ Pendente

## Objetivo técnico

O endpoint `POST /characters/:id/activity` já existe e funciona (ver [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]) — falta o frontend conseguir chamá-lo.

## Escopo

- Função `changeActivity(accessToken, characterId, activity, activityEndsAt?)` em `apps/game/src/lib/api.ts`, seguindo o mesmo padrão de `updateAppearance` (erro via `ApiError`, 401 via `authFetch`).
- Tipo `Activity` no frontend espelhando o do backend (hoje `activity`/`activityEndsAt` já existem em `Character`, só falta o tipo da união de valores possíveis).

## Onde no código

- `apps/game/src/lib/api.ts`

## Depende de

Nenhuma.

## Referências

- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
