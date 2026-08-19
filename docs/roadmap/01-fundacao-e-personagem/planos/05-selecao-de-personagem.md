# Plano — Seleção de Personagem

## Status

✅ Concluído

## Objetivo técnico

Deixar o jogador ver os personagens da própria conta e escolher qual jogar.

## Escopo

- Endpoint `GET /characters/mine`.
- `CharacterSelectPage`: lista os personagens com prévia composta (mesma engine de camadas do guarda-roupa), atalho pra criar um novo.
- `CharacterContext`: guarda o personagem selecionado em memória (não persiste entre recarregamentos — cada visita fresca volta pra seleção).

## Onde no código

- `apps/api/src/character/application/use-cases/list-my-characters.use-case.ts`
- `apps/game/src/pages/character-select/`
- `apps/game/src/character/CharacterContext.tsx`

## Depende de

- Criação de Personagem (plano 03), Guarda-roupa (plano 04, pra prévia).

## Referências

- [[../../../decisions/0015-multiplos-personagens-por-conta]]
- [[../../../decisions/0021-react-router-para-navegacao-do-game]]
