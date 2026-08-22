# Plano — Dashboard de necessidades

## Status

✅ Concluído — entregue como HUD sobre o mapa da cidade (ver M03), não como uma tela de dashboard separada: o escopo original nasceu antes da decisão de a Home ser a cidade (ver [[../../../decisions/0025-home-e-a-tela-da-cidade]]), então o "layout preparado pra crescer" virou painéis de HUD (`ProfilePanel`) em vez de seções de uma tela única. O conteúdo (felicidade/energia/dinheiro/fama + estado de erro) está todo lá.

## Objetivo técnico

Substituir o placeholder de `HomePage` (hoje só nome do personagem + botão de sair) por uma tela que mostra o estado de verdade do personagem.

## Escopo

- Exibir felicidade, energia, dinheiro e fama (ver [[../../../game-design/character-needs]]) com algum indicador visual (barra/medidor), não só número cru. ✅ `ProfilePanel.tsx` — felicidade/energia como `LuvStatBar` (bolinhas), dinheiro/fama com ícone.
- Layout preparado pra crescer: esta tela vira a "tela de vida" onde o seletor de atividade (plano 03) e, depois, os atalhos pra cidade (M03) e eventos (M05) vão morar. ✅ Superado: a cidade já é a Home (M03), e a HUD (`HomeHud.tsx`) já cresceu pra incluir clima/hora (`WorldClockPanel`), atividade atual (`CalendarPanel`) e busca de lotes (`MapSearchPanel`) — o seletor de atividade do plano 03 ainda falta.
- Estado de erro tratável (API fora do ar não deixa a tela em branco). ✅ `HomePage.tsx` mostra um card de erro dedicado.

## Onde no código

- `apps/game/src/pages/home/HomePage.tsx`, `HomePage.controller.ts`
- `apps/game/src/pages/home/hud/ProfilePanel.tsx` (onde o conteúdo deste plano acabou vivendo)

## Depende de

Nenhuma além do que a M01 já entrega (o `Character` já tem os quatro campos).

## Referências

- [[../../../game-design/character-needs]]
- [[../../../decisions/0022-paginas-separadas-em-controller-hook-e-view]]
