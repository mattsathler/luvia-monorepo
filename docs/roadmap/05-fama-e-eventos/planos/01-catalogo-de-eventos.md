# Plano — Catálogo de eventos

## Status

⏳ Pendente

## Objetivo técnico

Fechar quais eventos existem e quando ficam disponíveis, antes de implementar o mecanismo (plano 02).

## Escopo

- Definir 2 tipos de evento pra esta milestone (ex.: Festa, Feira — ver [[../../../game-design/events]]), cada um com duração e efeito.
- Regra de disponibilidade: horário fixo? Recorrente? Sempre disponível com fila? — decisão de game design a fechar aqui.
- Efeito de cada evento sobre Fama e/ou skills (relacionamentos ficam pra M05 — ver [[../descricao]]).

## Onde no código

- `apps/api/src/character/domain/entities/` (ou bounded context próprio de evento, se a modelagem justificar)

## Depende de

Nenhuma.

## Referências

- [[../../../game-design/events]]
