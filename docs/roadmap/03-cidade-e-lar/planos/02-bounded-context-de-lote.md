# Plano — Bounded context de lote

## Status

✅ Feito. Bounded context `City` criado em `apps/api/src/city/`, com entidade `Lot`, repositório Mongo, `GET /city` (lista a grade inteira) e `GET /city/lots/:characterId` (retorna o lote do personagem, reivindicando automaticamente — ver [[../../../decisions/0025-home-e-a-tela-da-cidade]]). Documentado em `docs/technical/api/city/endpoints.md`.

## Objetivo técnico

Modelar o lote como entidade persistida — posição na grade, tipo, dono — seguindo o mesmo padrão DDD dos bounded contexts existentes (`account`, `character`).

## Escopo

- Entidade `Lot`: id, dono (`accountId`/`characterId`), tipo (`residential` nesta milestone — `commercial`/`industrial` entram na M07), posição na grade da cidade.
- Repositório + persistência Mongo.
- Endpoint(s) pra listar lotes da cidade (pra renderizar a grade) e o(s) lote(s) de um jogador.
- Regra de posse: nenhum jogador pode ter mais de 1 lote de cada tipo (ver [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]) — nesta milestone, só residencial é validado; a regra já nasce genérica pra não precisar refatorar na M07.

## Onde no código

- Novo: `apps/api/src/lot/` (domain/application/infrastructure/presentation)

## Depende de

Nenhuma.

## Referências

- [[../../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../../decisions/0009-ddd-como-arquitetura-principal]]
- [[../../../game-design/lots-and-construction]]
