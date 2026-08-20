# 0025 — A home (`/play`) é a tela da cidade, não um dashboard separado

## Contexto

[[0021-react-router-para-navegacao-do-game]] fixou `/play` como a rota de `HomePage`, e o roadmap original tratava a cidade como uma tela à parte: [[../roadmap/02-loop-de-vida-wryd/descricao]] previa `HomePage` como um dashboard de necessidades (felicidade/energia/dinheiro/fama + seletor de atividade WRYD), e [[../roadmap/03-cidade-e-lar/planos/01-cidade-isometrica-no-jogo]] previa uma tela de cidade separada, com navegação de ida e volta entre as duas.

Ao começar a implementar a cidade (bounded context `City`, [[../roadmap/03-cidade-e-lar/planos/02-bounded-context-de-lote]]), essa divisão foi revisitada: o personagem só existe dentro da cidade (seu lote é o "lugar" dele no mundo), então não faz sentido ter um dashboard textual isolado da cidade — a cidade *é* a home.

## Decisão

`HomePage` (rota `/play`) passa a renderizar a cidade (grade isométrica via `IsoGrid`/`Block` de `luv-ui`), com o lote do próprio personagem destacado (tipo de tile `lot-mine`, ver `packages/luv-ui/src/city/Block/models/TilesTypes.ts`). Não existe uma rota `/city` separada — o que o roadmap chamava de "tela de cidade" e "tela de vida" (dashboard) são a mesma tela.

O dashboard de necessidades/WRYD ([[../roadmap/02-loop-de-vida-wryd/descricao]]) continua a ser construído, mas como parte dessa mesma `HomePage` (ex.: sobreposto à cidade), não como uma tela concorrente.

## Consequências

- [[../roadmap/03-cidade-e-lar/planos/01-cidade-isometrica-no-jogo]] e [[../roadmap/03-cidade-e-lar/planos/03-lote-residencial-do-jogador]] precisam ser lidos com essa correção: "tela de cidade" = `HomePage`, e o item de navegação dashboard↔cidade desses planos não se aplica mais.
- Novas features de personagem (WRYD, indicadores) devem ser desenhadas para conviver na mesma tela da cidade, não como rotas próprias.
- `GET /city` e `GET /city/lots/:characterId` (ver `docs/technical/api/city/endpoints.md`) já refletem esse uso: a segunda rota reivindica automaticamente o lote residencial do personagem na primeira leitura, adiantando parte de [[../roadmap/03-cidade-e-lar/planos/03-lote-residencial-do-jogador]] (a atribuição automática), sem ainda cobrir personalização/evolução de lote (planos 04/05) nem a metrópole navegável por inteiro (plano 06).

## Referências

- [[0021-react-router-para-navegacao-do-game]]
- [[../roadmap/02-loop-de-vida-wryd/descricao]]
- [[../roadmap/03-cidade-e-lar/planos/01-cidade-isometrica-no-jogo]]
- [[../roadmap/03-cidade-e-lar/planos/02-bounded-context-de-lote]]
- [[../roadmap/03-cidade-e-lar/planos/03-lote-residencial-do-jogador]]
