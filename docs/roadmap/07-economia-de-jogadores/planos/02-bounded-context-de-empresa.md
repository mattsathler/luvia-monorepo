# Plano — Bounded context de empresa

## Status

⏳ Pendente

## Objetivo técnico

Modelar a empresa como entidade própria — dona de um lote, com dono (jogador), tipo (comércio/indústria) e funcionários.

## Escopo

- Entidade `Company`: dono, lote associado (plano 01), tipo, caixa (dinheiro da empresa, separado do dinheiro pessoal do jogador — ver [[../../../game-design/companies]]).
- Criar empresa: exige possuir o lote comercial/industrial correspondente.
- Endpoints básicos: criar, consultar, listar empresas do jogador.

## Onde no código

- Novo: `apps/api/src/company/` (domain/application/infrastructure/presentation)

## Depende de

- Lotes comercial e industrial (plano 01).

## Referências

- [[../../../game-design/companies]]
- [[../../../decisions/0009-ddd-como-arquitetura-principal]]
