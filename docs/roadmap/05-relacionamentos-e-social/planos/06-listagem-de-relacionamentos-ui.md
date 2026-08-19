# Plano — Listagem de relacionamentos (UI)

## Status

⏳ Pendente

## Objetivo técnico

Deixar visível o que hoje só existiria no banco: quem é quem pro jogador.

## Escopo

- Tela/seção mostrando os relacionamentos do personagem, agrupados ou ordenados por nível.
- A partir da listagem, acesso rápido às ações já existentes (Visitar, Presentear, Convidar pra evento).
- Indicação clara de cônjuge, se houver (casamento é o nível mais alto).

## Onde no código

- Novo: `apps/game/src/pages/relationships/` (ou dentro do dashboard existente, se couber)

## Depende de

- Bounded context de relacionamento (plano 01).
- Ações Visitar (plano 02), Presentear (plano 03), Convidar pra evento (plano 04).

## Referências

- [[../../../game-design/relationships]]
