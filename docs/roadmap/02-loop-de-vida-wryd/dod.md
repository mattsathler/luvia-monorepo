# Definition of Done — M02 Loop de Vida (WRYD)

## Backend

- [x] Catálogo de prédios públicos e cargos em código (TS const), com habilidade principal/secundária/terciária por cargo (ver [[../../game-design/jobs]]). (`apps/api/src/employment/domain/entities/building-catalog.ts` — só 1 prédio de exemplo, Prefeitura/3 cargos; catálogo cresce aditivamente depois)
- [x] Nova entidade de local de trabalho (`Workplace` ou equivalente) — sem as regras de posse de `Lot`. (`apps/api/src/city/domain/entities/workplace.entity.ts`)
- [x] `working` calcula eficiência a partir das skills do personagem no cargo atual, em vez de usar uma taxa fixa. (`apps/api/src/employment/domain/entities/efficiency.ts` + `Contract.recomputeUntil`)
- [x] Promoção de cargo automática, baseada em eficiência acumulada × tempo trabalhado, verificada no mesmo recompute/tick dos demais efeitos. (`Contract.recomputeUntil`, `ContractTickScheduler`)
- [x] Testes cobrindo cálculo de eficiência, acúmulo de progresso e promoção (prorata ao trocar de atividade/emprego incluso). (100% de cobertura em `apps/api/src/employment`, incluindo troca de emprego sem descartar ganho pendente em `StartContractUseCase`)

## Frontend

- [ ] `apps/game/src/lib/api.ts` tem uma função cliente pra `POST /characters/:id/activity`.
- [x] `HomePage` mostra felicidade, energia, dinheiro e fama do personagem atual, atualizados. (`ProfilePanel.tsx`, dentro da HUD)
- [ ] Jogador consegue trocar de atividade pela UI (Ocioso / Descansar / Trabalhar), com feedback claro de qual está ativa.
- [ ] Ao escolher Trabalhar, jogador escolhe qual emprego (prédio + cargo disponível).
- [ ] UI mostra o cargo atual, a eficiência atual, e o progresso até a próxima promoção.
- [ ] Estado do personagem é atualizado por polling — sem precisar recarregar a página pra ver o efeito do tick.
- [x] Erros de rede/API no dashboard não quebram a tela (mostram estado de erro, não tela branca). (`HomePage.tsx`)

## Qualidade

- [x] Cobertura 100% mantida em todos os pacotes tocados.
- [x] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] Um personagem novo consegue, sem editar nada manualmente no banco: logar → criar personagem → escolher um emprego público → esperar (ou avançar o relógio do tick em dev) → ver dinheiro subir na UI, numa taxa condizente com sua eficiência.
- [ ] Documentação atualizada: `docs/technical/simulation-tick.md` fecha a decisão de intervalo de polling (hoje marcada como "Pendente"); `docs/game-design/wryd-activity-system.md` reflete a lista fechada de atividades desta milestone (sem Estudar).
