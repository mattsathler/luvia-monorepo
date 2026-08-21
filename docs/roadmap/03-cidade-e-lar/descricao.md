# M03 — Cidade & Lar

## Objetivo

Dar ao jogador um lugar: a cidade única e persistente de Luvia (ver [[../../game-design/city-and-world]]) passa a existir de verdade dentro do jogo, cada jogador possui e personaliza um lote residencial nela, e a cidade é navegável como espaço compartilhado — não só o quintal de cada um isolado.

## Status

⏳ Planejada. Escopo revisado depois da primeira versão: a descrição original não cobria personalização de lote nem navegação pela cidade como um todo — só posse + evolução mecânica do próprio lote. Planos 04 e 06 fecham essa lacuna.

## Planos

1. [[planos/01-cidade-isometrica-no-jogo]]
2. [[planos/02-bounded-context-de-lote]]
3. [[planos/03-lote-residencial-do-jogador]]
4. [[planos/04-personalizacao-de-lote]]
5. [[planos/05-evolucao-do-lote]]
6. [[planos/06-interacao-com-a-metropole]]
7. [[planos/07-lowys-carregamento-em-chunks]]
8. [[planos/08-relogio-do-mundo-e-ciclo-dia-noite]]

## Escopo

- **Cidade no jogo**: hoje `IsoGrid`/`Block`/`DayCycleControl` (grid isométrico, blocos, ciclo dia/noite) só existem como showcase em `apps/docs` — passam a ser usados de verdade numa tela de cidade em `apps/game`.
- **Bounded context de lote no backend**: persistência de lotes, dono, tipo, posição na grade.
- **Lote residencial**: todo personagem recebe (ou reivindica) 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]) — sem lote comercial/industrial ainda, esses vêm na M06 junto com empresas.
- **Personalização de lote**: catálogo fechado de aparência (fachada, telhado etc.), visível na cidade.
- **Evolução do lote**: melhorias mecânicas pré-definidas (não construção manual livre — ver [[../../game-design/lots-and-construction]]).
- **Interação com a metrópole**: a cidade é navegável por inteiro, não só o próprio lote — lotes de outros jogadores são visíveis (com a personalização deles) e consultáveis (dono, nível), preparando o terreno pra ações sociais que a M05 adiciona por cima.
- Navegação: jogador consegue ir da tela de vida (M02) pra cidade e voltar.
- **Relógio do mundo e ciclo dia/noite**: o backend passa a ditar a data/hora do jogo (relógio único e global, 96 minutos reais por dia de jogo), sincronizada pelo frontend e usada pra alimentar a iluminação já implementada em `DayCycleControl`.

## Fora do escopo

- Lote comercial e industrial (dependem de empresas — M06).
- Qualquer forma de construção manual/livre — explicitamente proibido pelo game design.
- Personagens (do próprio jogador ou de outros) visíveis/andando pela cidade — descartado (ver [[../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]], item 2). O que fica visível é o **lote**, não o personagem.
- Qualquer ação social sobre o lote de outro jogador (visitar, presentear, etc.) — só a visualização/consulta. As ações ficam pra M05.

## Estimativa

**2–3 semanas.** Os componentes visuais de grid isométrico já existem e estão testados (`packages/luv-ui`), o que remove a maior incerteza técnica (renderização isométrica). O trabalho novo é: bounded context de lotes no backend (seguindo o mesmo padrão DDD já estabelecido por `account`/`character`), personalização (reaproveitando o padrão de seletor já validado no guarda-roupa), e a tela de cidade no frontend consumindo tudo isso — incluindo a navegação pela cidade inteira, não só o lote próprio.

## Referências

- [[../../game-design/city-and-world]]
- [[../../game-design/lots-and-construction]]
- [[../../decisions/0005-cidade-unica-persistente]]
- [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../decisions/0009-ddd-como-arquitetura-principal]]
- [[../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
