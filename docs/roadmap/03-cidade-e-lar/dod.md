# Definition of Done — M03 Cidade & Lar

## Backend

- [ ] Bounded context de lote (domain/application/infrastructure/presentation) seguindo o padrão DDD dos demais.
- [ ] Todo personagem novo recebe (ou pode reivindicar) exatamente 1 lote residencial.
- [ ] Backend impede um personagem de ter mais de 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]).
- [ ] Endpoint pra evoluir/melhorar o lote (dentro das melhorias pré-definidas do game design).
- [ ] Endpoint pra personalizar a aparência do lote (catálogo fechado).
- [ ] Endpoint público de listagem de lotes da cidade (pra renderizar a grade inteira, não só o lote de quem está logado).

## Frontend

- [ ] Tela de cidade renderiza a grade isométrica com `IsoGrid`/`Block` de `luv-ui` dentro de `apps/game` (não só em `apps/docs`).
- [ ] A cidade inteira é navegável (não só o lote do jogador) — lotes de outros jogadores aparecem com a personalização deles.
- [ ] O lote do jogador aparece destacado/identificável na cidade.
- [ ] Jogador consegue personalizar a aparência do próprio lote pela UI e ver a mudança refletida na cidade.
- [ ] Jogador consegue evoluir o lote pela UI e ver a mudança refletida visualmente.
- [ ] Jogador consegue abrir o "perfil" (dono, nível, aparência) de um lote de outro jogador, sem nenhuma ação social disponível ainda.
- [ ] Navegação entre a tela de vida (dashboard) e a cidade funciona nos dois sentidos.

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] `docs/game-design/city-and-world.md` e `docs/game-design/lots-and-construction.md` atualizados se qualquer decisão de escopo mudou durante a implementação.
