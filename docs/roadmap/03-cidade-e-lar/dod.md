# Definition of Done — M03 Cidade & Lar

## Backend

- [x] Bounded context de lote (domain/application/infrastructure/presentation) seguindo o padrão DDD dos demais. (`apps/api/src/city/`)
- [x] Todo personagem novo recebe (ou pode reivindicar) exatamente 1 lote residencial. (`GetCharacterLotUseCase`, reivindica automaticamente)
- [x] Backend impede um personagem de ter mais de 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]). (`characterId` único no schema)
- [ ] Endpoint pra evoluir/melhorar o lote (dentro das melhorias pré-definidas do game design).
- [ ] Endpoint pra personalizar a aparência do lote (catálogo fechado).
- [x] Endpoint público de listagem de lotes da cidade (pra renderizar a grade inteira, não só o lote de quem está logado). (`GET /city/chunks/:x/:y` pro grid, `GET /city/lots?q=` pra busca)
- [ ] Mundo cresce sob demanda em unidades de Bairro quando as vagas residenciais se esgotam — ver [[../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]].
- [ ] Cada Bairro novo replica os prédios públicos obrigatórios do catálogo de [[../../game-design/jobs]] — nenhum jogador fica sem acesso a emprego público, independente do Bairro.
- [ ] Eficiência de trabalho inclui um fator de distância (em bairros) entre lote residencial e local de trabalho — distância 0 (mesmo Bairro) nunca sofre desconto (ver [[../../game-design/jobs]]).

## Frontend

- [x] Tela de cidade renderiza a grade isométrica com `IsoGrid`/`Block` de `luv-ui` dentro de `apps/game` (não só em `apps/docs`).
- [ ] A cidade inteira é navegável (não só o lote do jogador) — lotes de outros jogadores aparecem com a personalização deles. Parcial: navegável e lotes alheios visíveis/distinguíveis (`lot`/`lot-mine`) já funcionam; falta a personalização em si (plano 04).
- [x] O lote do jogador aparece destacado/identificável na cidade. (tipo `lot-mine`)
- [ ] Jogador consegue personalizar a aparência do próprio lote pela UI e ver a mudança refletida na cidade.
- [ ] Jogador consegue evoluir o lote pela UI e ver a mudança refletida visualmente.
- [ ] Jogador consegue abrir o "perfil" (dono, nível, aparência) de um lote de outro jogador, sem nenhuma ação social disponível ainda. Parcial: `MapSearchPanel` mostra dono/tipo/coordenadas via busca; falta nível/aparência (planos 04/05) e abrir isso a partir de um clique no mapa.
- [ ] ~~Navegação entre a tela de vida (dashboard) e a cidade funciona nos dois sentidos.~~ Não se aplica mais — a Home já é a cidade (ver [[../../decisions/0025-home-e-a-tela-da-cidade]]), não existem duas telas pra navegar entre si.

## Qualidade

- [x] Cobertura 100% mantida em todos os pacotes tocados.
- [x] `npm run build` limpo em `apps/api` e `apps/game`.
- [ ] `docs/game-design/city-and-world.md` (✅ já atualizado com Bairros) e `docs/game-design/lots-and-construction.md` (ainda pendente) refletem qualquer decisão de escopo que mudou durante a implementação.
