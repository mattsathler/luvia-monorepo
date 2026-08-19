# Plano — Empregos privados

## Status

⏳ Pendente

## Objetivo técnico

Empresas de jogadores passam a contratar outros jogadores, criando o segundo tipo de emprego previsto pelo game design (ver [[../../../game-design/jobs]]) — o primeiro (público) já existe desde a M02.

## Escopo

- Empresa (plano 02) define vaga(s) com salário próprio (potencialmente maior que o público, mas dependente da saúde financeira da empresa).
- Jogador se candidata/é contratado; atividade "Trabalhar" (M02) passa a ter uma variante que aponta pra uma empresa específica em vez do emprego público genérico.
- Empresa paga o salário a partir do próprio caixa — se não tiver caixa suficiente, definir o que acontece (atraso? demissão automática? decisão de game design a fechar aqui).

## Onde no código

- `apps/api/src/company/`
- `apps/api/src/character/domain/entities/activity.ts` (variante de "Trabalhar" com empresa alvo)

## Depende de

- Bounded context de empresa (plano 02).

## Referências

- [[../../../game-design/jobs]]
- [[../../02-loop-de-vida-wryd/planos/03-seletor-de-atividade]]
