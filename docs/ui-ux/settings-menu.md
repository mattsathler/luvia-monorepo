# Menu de configurações

## Status

🚧 Necessidade identificada, nada implementado ainda.

## Objetivo

Registrar a necessidade de um menu de configurações do jogo — hoje não existe nenhum lugar na UI pra ajustes que são preferência do jogador (não estado de personagem/mundo). O primeiro ajuste que precisa dele é o zoom da cidade.

## Contexto

O zoom do grid da cidade (tamanho do tile, ver [[../technical/lowys-carregamento-em-chunks]]) foi implementado com um controle `+`/`-` flutuante sobre o mapa, mas essa UI foi removida — colocar um controle desses solto na tela quebra os [[interface-principles|princípios de interface]] (poucos elementos simultâneos, minimalista) fora do fluxo principal de jogo. A lógica (`zoomIn`/`zoomOut`, limites, persistência) continua implementada em `apps/game/src/pages/home/HomePage.controller.ts`, só não está exposta — o valor atual (`DEFAULT_TILE_SIZE`) é fixo até existir um lugar apropriado pra esse tipo de ajuste.

## Decisões consolidadas

Nenhuma ainda — este doc só registra a necessidade.

## Pendente

- Onde o menu de configurações vive na navegação (ícone fixo? dentro de um menu de pausa/perfil?).
- Estrutura: um menu genérico com seções (zoom, áudio, notificações, etc.) ou telas dedicadas por categoria.
- Quais ajustes além do zoom entram na v1 (áudio, quando existir; densidade de UI; idioma, se/quando houver mais de um).
- Se a persistência continua por `localStorage` (como o zoom já faz) ou passa a ser por conta (sincronizada entre dispositivos) quando fizer sentido.

## Referências

- [[interface-principles]]
- [[../technical/lowys-carregamento-em-chunks]]
