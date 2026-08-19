# Definition of Done — M02 Loop de Vida (WRYD)

## Backend

- [ ] `Activity` inclui `studying`, com taxa de efeito própria (aumenta pontos de uma skill escolhida, ver `character.entity.ts`/`activity.ts`).
- [ ] `ChangeActivityDto`/endpoint aceitam informar qual skill está sendo estudada quando `activity === 'studying'`.
- [ ] Testes cobrindo o novo efeito de `studying` (prorata ao trocar de atividade incluso).

## Frontend

- [ ] `apps/game/src/lib/api.ts` tem uma função cliente pra `POST /characters/:id/activity`.
- [ ] `HomePage` mostra felicidade, energia, dinheiro e fama do personagem atual, atualizados.
- [ ] Jogador consegue trocar de atividade pela UI (Ocioso / Descansar / Trabalhar / Estudar), com feedback claro de qual está ativa.
- [ ] Ao escolher Estudar, jogador escolhe qual skill está estudando.
- [ ] Estado do personagem é atualizado por polling — sem precisar recarregar a página pra ver o efeito do tick.
- [ ] Erros de rede/API no dashboard não quebram a tela (mostram estado de erro, não tela branca).

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] Um personagem novo consegue, sem editar nada manualmente no banco: logar → criar personagem → escolher "Trabalhar" → esperar (ou avançar o relógio do tick em dev) → ver dinheiro subir na UI.
- [ ] Documentação atualizada: `docs/technical/simulation-tick.md` fecha a decisão de intervalo de polling (hoje marcada como "Pendente"); `docs/game-design/wryd-activity-system.md` reflete a lista fechada de atividades desta milestone.
