# Definition of Done — M06 Relacionamentos & Social

## Backend

- [ ] Bounded context de relacionamento: dois personagens podem ter um relacionamento com nível (conhecido/amigo/melhor amigo/namoro/casamento).
- [ ] Pelo menos 2 ações de interação implementadas (ex.: visitar, presentear), cada uma com efeito definido sobre o nível do relacionamento.
- [ ] Participar do mesmo evento (M05) junto com outro jogador afeta o relacionamento entre os dois.
- [ ] Regras de transição entre níveis (o que evolui, o que não regride, etc.) implementadas e testadas.

## Frontend

- [ ] Jogador vê a lista dos seus relacionamentos e o nível de cada um.
- [ ] Jogador consegue executar as ações de interação disponíveis a partir da tela de outro personagem/lote.
- [ ] Nenhuma superfície de chat (texto livre entre jogadores) existe em nenhuma tela.

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] `docs/game-design/relationships.md` e `docs/game-design/social-interactions.md` atualizados com a lista fechada de ações e regras de progressão desta milestone.
