# M07 — Polimento & Lançamento

## Objetivo

Levar o jogo funcional (M01–M06) a um estado lançável: conteúdo suficiente pra não parecer vazio, progressão de longo prazo balanceada (ver [[../../vision/principles]] — Long Term Progression), e operação de produção verificada.

## Status

⏳ Planejada.

## Escopo

- **Conteúdo**: mais variedade de roupas/aparência, mais tipos de evento, mais produtos/empregos — o suficiente pra a cidade não parecer repetitiva nas primeiras semanas de jogador real.
- **Balanceamento**: revisar as taxas de efeito (`RATES_PER_MINUTE` e equivalentes em M04/M06) que são placeholder desde a M01, com base em como o jogo se sente jogando de verdade — não em teoria.
- **Teste de carga do tick em lote**: validar que `CharacterTickScheduler` aguenta um volume realista de personagens simultâneos sem atrasar (ver [[../../technical/simulation-tick]] — tamanho de lote e intervalo ainda marcados como "Pendente" nesse documento).
- **Responsividade e acessibilidade**: revisão geral das telas do jogo (não só componentes isolados do design system).
- **Checklist de operação**: backup do banco, monitoramento básico, plano de rollback de deploy.

## Fora do escopo

- Novas mecânicas de jogo — esta milestone não adiciona sistema novo, só amadurece o que já existe.
- Escala além do que o tick em lote já suporta (multi-região, sharding) — problema de "sucesso", não de lançamento.

## Estimativa

**2–4 semanas.** Variância alta de propósito: quanto conteúdo/balanceamento é "suficiente" só fica claro jogando o que as milestones anteriores produziram. Tratar como uma faixa, não um prazo fixo — e é aceitável que esta milestone gere um M08 de pós-lançamento se algo relevante não couber no tempo.

## Referências

- [[../../vision/principles]]
- [[../../vision/final-goal]]
- [[../../technical/simulation-tick]]
- [[../../decisions/0016-cobertura-de-testes-obrigatoria-100]]
