# Plano — Cidade isométrica no jogo

## Status

🚧 Em andamento. `HomePage` (`/play`) já renderiza a grade isométrica (`IsoGrid`/`Block`) com dados reais de `GET /city`, com o lote do jogador destacado. Não existe rota `/city` separada — ver [[../../../decisions/0025-home-e-a-tela-da-cidade]], que corrige a premissa deste plano de que cidade e dashboard (M02) seriam telas distintas com navegação entre elas. Falta: cidade navegável por inteiro (plano 06), personalização/evolução de lote (planos 04/05), `DayCycleControl` ligado a uma hora de jogo de verdade (plano 08 — hoje só existe como slider manual em `apps/docs`).

## Objetivo técnico

Os componentes de grid isométrico (`IsoGrid`, `Block`, `DayCycleControl`, `TILE_TYPES`) já existem no design system, testados, mas só são usados como showcase em `apps/docs`. Este plano é puramente sobre trazer isso pra dentro do jogo de verdade.

## Escopo

- Tela de cidade em `apps/game` renderizando a grade isométrica.
- Navegação entre a tela de vida (dashboard da M02) e a cidade, nos dois sentidos.
- Fonte dos tiles da cidade vem do backend (plano 02), não mais de um gerador de exemplo (`ExampleCity.ts` só existe em `apps/docs`).

## Onde no código

- Novo: `apps/game/src/pages/city/` (ou equivalente)
- Reaproveita: `packages/luv-ui/src/city/` (`IsoGrid`, `Block`, `DayCycleControl`, `TILE_TYPES`)

## Depende de

- Bounded context de lote (plano 02), pra ter dados reais de tile pra desenhar.

## Referências

- [[../../../game-design/city-and-world]]
- [[../../../decisions/0021-react-router-para-navegacao-do-game]]
