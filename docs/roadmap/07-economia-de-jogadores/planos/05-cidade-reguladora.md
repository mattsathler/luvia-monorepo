# Plano — Cidade reguladora

## Status

⏳ Pendente

## Objetivo técnico

A cidade age como consumidor de última instância e fonte de emprego seguro (ver [[../../../game-design/economy]]), fechando o fluxo `Indústria → Comércio → Cidade` e evitando que a economia trave se não houver comprador entre jogadores.

## Escopo

- Cidade compra produto do comércio a um preço base (sempre disponível, sem negociação — diferente de contrato entre jogadores, plano 07).
- Cidade "vende" produtos também (ex.: pro personagem consumir/comprar itens) — avaliar se isso já é necessário nesta milestone ou se fica pra depois.
- Emprego público (já usado desde a M02 como "Trabalhar") continua sempre disponível, agora formalmente descrito como parte da regulação econômica da cidade, não um valor solto.

## Onde no código

- `apps/api/src/company/` ou bounded context próprio (`city`, se justificar a separação)

## Depende de

- Comércio: transformação e venda (plano 04).

## Referências

- [[../../../game-design/economy]]
- [[../../../game-design/jobs]]
