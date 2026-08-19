# Definition of Done — M03 Cidade & Lar

## Backend

- [ ] Bounded context de lote (domain/application/infrastructure/presentation) seguindo o padrão DDD dos demais.
- [ ] Todo personagem novo recebe (ou pode reivindicar) exatamente 1 lote residencial.
- [ ] Backend impede um personagem de ter mais de 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]).
- [ ] Endpoint pra evoluir/melhorar o lote (dentro das melhorias pré-definidas do game design).

## Frontend

- [ ] Tela de cidade renderiza a grade isométrica com `IsoGrid`/`Block` de `luv-ui` dentro de `apps/game` (não só em `apps/docs`).
- [ ] O lote do jogador aparece destacado/identificável na cidade.
- [ ] Jogador consegue evoluir o lote pela UI e ver a mudança refletida visualmente.
- [ ] Navegação entre a tela de vida (dashboard) e a cidade funciona nos dois sentidos.

## Qualidade

- [ ] Cobertura 100% mantida em todos os pacotes tocados.
- [ ] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] `docs/game-design/city-and-world.md` e `docs/game-design/lots-and-construction.md` atualizados se qualquer decisão de escopo mudou durante a implementação.
