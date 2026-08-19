# Definition of Done — M04 Fama & Eventos

## Backend

- [ ] Pelo menos 2 tipos de evento definidos, cada um com efeito próprio sobre Fama/skills.
- [ ] Evento é implementado como `Activity` com `activityEndsAt`, sem exigir nenhuma mudança estrutural no motor de tick.
- [ ] Regra de disponibilidade do evento (quando ele pode ser iniciado) implementada e testada.

## Frontend

- [ ] Jogador vê a lista de eventos disponíveis e consegue participar de um.
- [ ] Evento tem um local visível na tela de cidade (M03), não só num menu solto.
- [ ] Enquanto o evento está ativo, a UI deixa claro que o personagem está ocupado até `activityEndsAt`.
- [ ] Fama do personagem é exibida na UI (dashboard da M02), não só existe no banco.
- [ ] Nenhuma tela usa a palavra "Level" em lugar nenhum — sempre "Fama" (ver [[../../decisions/0003-fama-substitui-level]]).

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] `docs/game-design/events.md` atualizado com a lista fechada de eventos desta milestone e a regra de disponibilidade.
