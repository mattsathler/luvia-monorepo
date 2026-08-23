# M03 — Cidade & Lar

## Objetivo

Dar ao jogador um lugar: a cidade única e persistente de Luvia (ver [[../../game-design/city-and-world]]) passa a existir de verdade dentro do jogo, cada jogador possui e personaliza um lote residencial nela, e a cidade é navegável como espaço compartilhado — não só o quintal de cada um isolado.

## Status

🔄 Em andamento. Escopo revisado depois da primeira versão: a descrição original não cobria personalização de lote nem navegação pela cidade como um todo — só posse + evolução mecânica do próprio lote. Planos 04 e 06 fecham essa lacuna. Boa parte já implementada, em geral fora da ordem numérica dos planos (relógio do mundo, clima e LOWYS chegaram antes de personalização/evolução de lote) — faltam planos 04 e 05 por completo, e o 06 está parcial.

## Planos

1. [[planos/01-cidade-isometrica-no-jogo]] — ✅ Feito
2. [[planos/02-bounded-context-de-lote]] — ✅ Feito
3. [[planos/03-lote-residencial-do-jogador]] — 🚧 Em andamento
4. [[planos/04-personalizacao-de-lote]] — ⏳ Pendente
5. [[planos/05-evolucao-do-lote]] — ⏳ Pendente
6. [[planos/06-interacao-com-a-metropole]] — 🚧 Em andamento
7. [[planos/07-lowys-carregamento-em-chunks]] — ✅ Feito
8. [[planos/08-relogio-do-mundo-e-ciclo-dia-noite]] — ✅ Feito
9. [[planos/09-clima-e-temperatura]] — ✅ Feito
10. [[planos/10-bairros-e-expansao-do-mundo]] — ⏳ Pendente

## Escopo

- **Cidade no jogo**: hoje `IsoGrid`/`Block`/`DayCycleControl` (grid isométrico, blocos, ciclo dia/noite) só existem como showcase em `apps/docs` — passam a ser usados de verdade numa tela de cidade em `apps/game`. ✅ Feito — a própria Home é a cidade (ver [[../../decisions/0025-home-e-a-tela-da-cidade]]), não uma tela separada como o texto original previa.
- **Bounded context de lote no backend**: persistência de lotes, dono, tipo, posição na grade. ✅ Feito (`apps/api/src/city/`).
- **Lote residencial**: todo personagem recebe (ou reivindica) 1 lote residencial (ver [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]) — sem lote comercial/industrial ainda, esses vêm na M07 junto com empresas. ✅ Feito.
- **Personalização de lote**: catálogo fechado de aparência (fachada, telhado etc.), visível na cidade. ⏳ Pendente.
- **Evolução do lote**: melhorias mecânicas pré-definidas (não construção manual livre — ver [[../../game-design/lots-and-construction]]). ⏳ Pendente.
- **Interação com a metrópole**: a cidade é navegável por inteiro, não só o próprio lote — lotes de outros jogadores são visíveis (com a personalização deles) e consultáveis (dono, nível), preparando o terreno pra ações sociais que a M06 adiciona por cima. 🚧 Parcial — pan/zoom pela cidade inteira (com modo de arrasto explícito na HUD) e lotes alheios visíveis/distinguíveis já existem, mais uma busca de lotes (`MapSearchPanel`/`GET /city/lots`, com distância até a casa do jogador) e um "perfil" de lote (`LotDetailModal` com dono/tipo/coordenadas) abrível tanto pelo clique no mapa quanto pela busca; falta personalização visível e "nível" (dependem dos planos 04/05).
- ~~Navegação: jogador consegue ir da tela de vida (M02) pra cidade e voltar.~~ Não se aplica mais — a M02 não tem tela separada, a Home já é a cidade.
- **Relógio do mundo e ciclo dia/noite**: o backend passa a ditar a data/hora do jogo (relógio único e global, 96 minutos reais por dia de jogo), sincronizada pelo frontend e usada pra alimentar a iluminação já implementada em `DayCycleControl`. ✅ Feito.
- **Clima e temperatura**: clima (Ensolarado, Chuvoso, Neblina, com viés pra chuva — Luvia é uma cidade chuvosa) e temperatura (Celsius) determinísticos por dia de jogo, exibidos na HUD. ✅ Feito — inicialmente só cosmético (ver [[../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]), decisão parcialmente revogada pela M04 (Clima & Produtividade), que dá efeito de jogabilidade a isso.
- **Bairros e expansão do mundo** (novo, plano 10): Luvia não é só uma cidade, é um mundo — vagas residenciais finitas eventualmente lotam. O mundo passa a crescer sob demanda em unidades de Bairro, cada uma replicando os prédios públicos obrigatórios (ver [[../../game-design/jobs]]). Distância até o trabalho reduz eficiência de verdade, mas ninguém sai em desvantagem sistêmica por isso — todo Bairro tem os mesmos prédios, então a opção de distância 0 sempre existe — ver [[../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]. ⏳ Pendente.

## Fora do escopo

- Lote comercial e industrial (dependem de empresas — M07).
- Qualquer forma de construção manual/livre — explicitamente proibido pelo game design.
- Personagens (do próprio jogador ou de outros) visíveis/andando pela cidade — descartado (ver [[../../decisions/0019-personagem-montado-em-camadas-com-rig-2d]], item 2). O que fica visível é o **lote**, não o personagem.
- Qualquer ação social sobre o lote de outro jogador (visitar, presentear, etc.) — só a visualização/consulta. As ações ficam pra M06.

## Estimativa

**2–3 semanas.** Os componentes visuais de grid isométrico já existem e estão testados (`packages/luv-ui`), o que remove a maior incerteza técnica (renderização isométrica). O trabalho novo é: bounded context de lotes no backend (seguindo o mesmo padrão DDD já estabelecido por `account`/`character`), personalização (reaproveitando o padrão de seletor já validado no guarda-roupa), e a tela de cidade no frontend consumindo tudo isso — incluindo a navegação pela cidade inteira, não só o lote próprio.

## Referências

- [[../../game-design/city-and-world]]
- [[../../game-design/lots-and-construction]]
- [[../../decisions/0005-cidade-unica-persistente]]
- [[../../decisions/0006-um-lote-de-cada-tipo-por-jogador]]
- [[../../decisions/0009-ddd-como-arquitetura-principal]]
- [[../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../../decisions/0029-clima-cosmetico-e-cidade-chuvosa]]
- [[../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]
- [[../../technical/bairros-e-expansao-do-mundo]]
