# Definition of Done — M08 Polimento & Lançamento

## Conteúdo & Balanceamento

- [ ] Pelo menos o dobro das opções de aparência (roupas/cabelo) disponíveis em relação à M01.
- [ ] Pelo menos 4 tipos de evento distintos (M05 entregou 2).
- [ ] Taxas de efeito de todas as atividades (WRYD, eventos, produção) revisadas com base em playtesting real, não só no valor placeholder original.
- [ ] Progresso de Fama e de skills verificado como lento o suficiente pra não ser maximizável em poucos dias (ver [[../../vision/principles]] — Long Term Progression).

## Operação

- [ ] Teste de carga do `CharacterTickScheduler` com volume de personagens definido como meta de lançamento, sem atraso perceptível de recompute.
- [ ] `docs/technical/simulation-tick.md` sem nenhum item marcado "Pendente".
- [ ] Backup automático do MongoDB configurado e testado (restaurar de um backup funciona).
- [ ] Monitoramento básico (erros, uptime) configurado em produção.
- [ ] Plano de rollback de deploy documentado e testado ao menos uma vez.

## UI/UX

- [ ] Todas as telas do jogo (não só componentes isolados) revisadas em mobile e desktop.
- [ ] Revisão de acessibilidade básica (labels, contraste, navegação por teclado) nas telas principais do fluxo de jogo.

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes.
- [ ] `npm run build` limpo em todo o monorepo.
- [ ] Nenhuma decisão em `docs/decisions/` ou documento de game design com pendência bloqueante pro lançamento.
