# Plano — Interação com a metrópole

## Status

🚧 Em andamento. Navegação pan/zoom pela cidade **inteira** já existe (`CityGrid.tsx` — arrastar pra rolar, `zoomIn`/`zoomOut` em `HomePage.controller.ts`), e lotes de outros jogadores já aparecem na grade, distinguíveis do próprio (`CityGrid.controller.ts` computa `"lot"` vs `"lot-mine"` por `characterId`). `GET /city/lots?q=` (`SearchLotsUseCase`) já lista/busca todos os lotes da cidade com dono e tipo — construído como a HUD "MapSearchPanel" (ícone de mapa, canto inferior esquerdo), fora de ordem em relação a este plano, mas cobrindo boa parte do que ele pede ("ver e localizar outros lotes"). Falta: personalização visível nos lotes alheios (plano 04, ainda não existe) e um "perfil" de lote clicável a partir do próprio mapa (hoje só existe via a busca — clicar um tile no mapa só loga, não abre nada; ver `HomePage.controller.ts#handleTileClick`).

## Objetivo técnico

A cidade é única e persistente (ver [[../../../decisions/0005-cidade-unica-persistente]]) — "todos vivem nela". Sem este plano, cada jogador só veria o próprio lote isolado, o que não é uma cidade, é um quintal.

## Escopo

- Tela de cidade (plano 01) renderiza a grade **inteira**, não só o lote do jogador — navegação (pan/zoom ou equivalente) pela cidade completa. ✅ Feito.
- Lotes de outros jogadores aparecem na grade, com a personalização deles visível (plano 04) — visualização, não interação ainda. ✅ Aparecem e são distinguíveis (`lot`/`lot-mine`); ⏳ sem personalização ainda (plano 04 pendente).
- Jogador consegue abrir o "perfil" de um lote alheio (dono, nível — sem nenhuma ação social ainda, isso é escopo da M06). 🚧 Parcial: `MapSearchPanel` mostra dono + tipo + coordenadas via busca; falta "nível" (depende do plano 05) e um jeito de abrir isso a partir de um clique no próprio mapa, não só pela busca.
- Esta é a infraestrutura de navegação que a M06 (ação "Visitar") vai consumir — este plano não inclui nenhuma ação, só a capacidade de ver e localizar outros lotes.

## Onde no código

- `apps/game/src/pages/home/CityGrid.tsx`, `CityGrid.controller.ts` (pan/zoom, distinção `lot`/`lot-mine`)
- `apps/game/src/pages/home/hud/MapSearchPanel.tsx` (busca de lotes)
- `apps/api/src/city/presentation/city.controller.ts` (`GET /city/lots`, `SearchLotsUseCase`)

## Depende de

- Cidade isométrica no jogo (plano 01).
- Personalização de lote (plano 04, pra ter algo visual pra mostrar nos lotes alheios).

## Referências

- [[../../../decisions/0005-cidade-unica-persistente]]
- [[../../../game-design/city-and-world]]
- [[../../06-relacionamentos-e-social/planos/02-acao-visitar]]
