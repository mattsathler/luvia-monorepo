# Cidade e Mundo

## Objetivo

Definir a estrutura do mundo do jogo.

## Decisões consolidadas

### Cidade

Existe apenas uma cidade. Todos vivem nela. A cidade é persistente.

### Mundo

A visualização principal é isométrica. Vetorizado / ilustrado. Cozy. Poucos elementos animados. Sem excesso de efeitos.

### Terreno

A cidade é uma grade completa, não só lotes: grama, ruas (que se conectam formando cruzamentos), uma lagoa e pontos de interesse (prédios públicos). Só terreno de grama é reivindicável como lote residencial — rua, lagoa e pontos de interesse nunca podem ser ocupados por um jogador. Nenhuma rua cruza a lagoa (não modelamos pontes ainda). Sem borda fixa de oceano ao redor da cidade — a ideia é a cidade poder crescer conforme mais jogadores entram, não ter um limite de mundo fixo. O terreno é gerado uma vez, de forma determinística, e persistido — não recalculado a cada visita (ver [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]] e [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]).

## Referências

- [[lots-and-construction]]
- [[../ui-ux/visual-art-style]]
- [[../decisions/0005-cidade-unica-persistente]]
- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
