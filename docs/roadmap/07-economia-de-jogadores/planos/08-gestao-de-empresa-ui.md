# Plano — Gestão de empresa (UI)

## Status

⏳ Pendente

## Objetivo técnico

Dar ao jogador uma tela pra administrar a própria empresa — sem isso, todo o resto da milestone fica invisível.

## Escopo

- Tela de empresa: produção/estoque atual, funcionários (se aplicável), contratos ativos, caixa.
- Fluxo de contratação de funcionário (plano 06) e criação/aceite de contrato (plano 07) a partir daqui.
- Estado atualiza via o mesmo mecanismo de polling já estabelecido na M02.

## Onde no código

- Novo: `apps/game/src/pages/company/`

## Depende de

- Todos os planos de backend desta milestone (02 a 07), pelo menos parcialmente, pra ter o que exibir.

## Referências

- [[../../02-loop-de-vida-wryd/planos/05-polling-de-estado]]
- [[../../../decisions/0022-paginas-separadas-em-controller-hook-e-view]]
