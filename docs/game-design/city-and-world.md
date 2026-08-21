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

### Carregamento e renderização

O cliente não carrega nem renderiza a cidade inteira de uma vez — só o que está (ou pode ficar, com uma margem pequena) visível pro jogador, carregando o resto sob demanda conforme ele rola a tela (sistema **LOWYS** — ver [[../technical/lowys-carregamento-em-chunks]]).

### Tempo e iluminação

Existe um relógio de mundo único e global — a mesma data/hora de jogo pra todos os jogadores, ditada pelo backend, nunca pelo relógio do próprio dispositivo. O tempo de jogo corre num ritmo fixo de **96 minutos reais por dia de jogo (24h)**. Essa hora alimenta o ciclo dia/noite visual da cidade isométrica (posição do sol, tom de luz) — ver [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]] e [[../technical/relogio-do-mundo]].

## Referências

- [[lots-and-construction]]
- [[../ui-ux/visual-art-style]]
- [[../decisions/0005-cidade-unica-persistente]]
- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../technical/lowys-carregamento-em-chunks]]
- [[../technical/relogio-do-mundo]]
