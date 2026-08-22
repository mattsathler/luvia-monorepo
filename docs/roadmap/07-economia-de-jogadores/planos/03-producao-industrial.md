# Plano — Produção industrial

## Status

⏳ Pendente

## Objetivo técnico

Indústria produz matéria-prima ao longo do tempo — primeira metade do fluxo `Indústria → Comércio → Cidade` (ver [[../../../game-design/industry-system]]).

## Escopo

- Empresa do tipo indústria acumula matéria-prima com o tempo (mecanismo análogo ao tick de personagem — decidir se reaproveita o mesmo motor genérico da M01/M02 aplicado à empresa, ou se merece scheduler próprio).
- Capacidade de produção limitada (não é infinito) — decisão de balanceamento a fechar aqui.
- Matéria-prima fica disponível pro comércio comprar (plano 04).

## Onde no código

- `apps/api/src/company/`

## Depende de

- Bounded context de empresa (plano 02).

## Referências

- [[../../../game-design/industry-system]]
- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
