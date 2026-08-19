# Plano — Contratos entre empresas

## Status

⏳ Pendente

## Objetivo técnico

Formalizar negociação entre empresas de jogadores além da venda automática pra cidade (plano 05) — dá espaço pra jogadores negociarem entre si (ver [[../../../game-design/contracts]]).

## Escopo

- Entidade `Contract`: produto, quantidade, prazo, valor, partes envolvidas.
- Ciclo de vida: proposto → aceito → cumprido ou falho (falha explícita é decisão de game design já registrada — ver [[../../../game-design/contracts]]).
- Cumprimento de contrato move produto/dinheiro entre as empresas envolvidas.

## Onde no código

- Novo: `apps/api/src/contract/` (ou dentro de `company/`, se a modelagem justificar não separar)

## Depende de

- Bounded context de empresa (plano 02).

## Referências

- [[../../../game-design/contracts]]
