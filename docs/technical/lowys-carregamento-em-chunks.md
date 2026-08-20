# LOWYS — Load Only What You See

## Status

✅ Implementado. Backend: `apps/api/src/city/domain/entities/chunk.ts` + `GetCityChunkUseCase` + `GET /city/chunks/:x/:y`. Frontend: `apps/game/src/pages/home/CityGrid.controller.ts` (cache + janela de render) + `CityGrid.tsx` (placeholders + `IntersectionObserver`). Todos os "Pendente" abaixo que dependiam de uma decisão de implementação foram fechados; os que são sobre trade-offs de produto/operação continuam em aberto (ver Observações).

## Objetivo

Definir como a cidade é carregada do backend e renderizada no frontend sem precisar transferir nem montar o mapa inteiro de uma vez — a base pra cidade continuar performática conforme cresce (grama, ruas, lotes, prédios) e, no limite, conforme ela passa a crescer dinamicamente (ver [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]).

## Contexto

Antes do LOWYS, `GET /city` devolvia **todos** os tiles da grade numa resposta só (1600 tiles pra 40×40), e o frontend (`IsoGrid`) montava um elemento DOM por tile sempre — mesmo os que não estavam visíveis na tela. Isso tinha dois custos que cresciam junto com a cidade:

- **Payload de rede**: o corpo de `GET /city` crescia proporcional a `width × height`. Numa cidade que cresce dinamicamente (decisão 0027), não existe um "tudo" fixo pra buscar de uma vez.
- **Custo de render**: cada tile já era uma `<div class="tile">` com ao menos uma `<div class="face">` filha. Quando lotes personalizados (ver [[../roadmap/03-cidade-e-lar/planos/04-personalizacao-de-lote]]) ganharem visual próprio (fachada, prédio), cada lote ocupado vai precisar de mais DOM ainda — multiplicando o custo de manter tudo montado de uma vez, mesmo o que está fora da tela.

## Decisões consolidadas

### Nome

O sistema (backend + frontend) é chamado de **LOWYS** (Load Only What You See).

### Backend: carregamento em chunks

A grade da cidade é particionada em **chunks** — blocos quadrados de **10×10 tiles** (`CHUNK_SIZE`, `apps/api/src/city/domain/entities/chunk.ts`). `40/10` dá 4×4 = 16 chunks hoje; a função de partição não assume divisão exata (tolera um chunk parcial na borda, importante pra quando a cidade crescer sem tamanho fixo — decisão 0027).

`GET /city` encolheu pra só `{ width, height }` — dimensões da grade, usadas pelo frontend pra saber quantos chunks existem e dimensionar a área de scroll, sem buscar terreno nenhum. `GET /city/chunks/:x/:y` (`:x`/`:y` = coordenada do **chunk**, não do tile) devolve `{ tiles, lots }` só daquela região — `GetCityChunkUseCase` filtra o `CityMap` já gerado/persistido (ver [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]) e a lista de lotes por essa região; nada muda na geração do terreno em si. Uma coordenada de chunk fora da grade real devolve `{ tiles: [], lots: [] }`, sem erro. Documentado em [[api/city/endpoints]].

Cada chamada de chunk ainda busca o documento `city_maps` inteiro e a coleção `lots` inteira do Mongo, filtrando em memória — não é uma query por região de verdade. Aceitável na escala atual (uma cidade, pré-lançamento); revisitar se a carga de jogadores concorrentes crescer.

### Frontend: janela de render + cache local

O client mantém dois conceitos separados (`CityGrid.controller.ts`):

- **Cache de dados**: um `Map` (num `useRef`, nunca expira dentro da sessão) indexado por coordenada de chunk (`"${chunkX}:${chunkY}"`), guardando os tiles já buscados e transformados (com a posse de lote já mesclada — `buildChunkTiles`).
- **Janela de render**: o conjunto de chunks atualmente montados como DOM (`Block` por tile, um `useState<Set<string>>`).

Mecanismo de visibilidade: um único `IntersectionObserver` compartilhado (não um por chunk), com `root` no próprio contêiner de scroll (`.iso-grid`) e `rootMargin: '640px'` (~1 chunk de buffer em todas as direções). Cada chunk tem um placeholder — uma `<div>` posicionada/dimensionada pela mesma fórmula de projeção isométrica que `Block` já usa, só que calculada a partir dos 4 cantos do chunk em vez de escanear tiles — com `data-chunk-x`/`data-chunk-y`, observado por esse único observer. Isso evita inverter a projeção isométrica (losango) a partir de `scrollLeft`/`scrollTop` na mão.

- **Chunk que entra na margem**: se já está no cache, monta na hora (sem chamada de rede); se não está, busca (`getCityChunk`), guarda no cache e só então monta.
- **Chunk que sai da margem**: desmonta do DOM (para de custar render), mas **continua no cache** — se o jogador rolar de volta, remonta a partir do cache, sem nova chamada de rede.

Esse último ponto é o que resolve diretamente o requisito original: descer a view e voltar pra cima não custa outra chamada no back.

**Falha ao buscar um chunk**: não cacheia nada; o chunk fica sem renderizar (sem nenhum indicador visual de erro ainda — não há UI pra isso); a próxima vez que ele entrar na margem, a busca é repetida automaticamente.

`packages/luv-ui` (`IsoGrid`/`Block`) não mudou — o LOWYS vive inteiro em `apps/game`, usando `Block`/`TILE_TYPES` (já exportados publicamente) direto. `apps/docs` continua passando o array de tiles inteiro pro `IsoGrid`, sem chunking.

### Tamanho do tile como otimização adicional (zoom)

Tile maior = menos tiles cabem na tela = menos DOM montado por vez, então o tamanho do tile (`tileSize`) é mais uma alavanca da mesma otimização, independente do chunking. `HomePage.controller.ts` já implementa o ajuste (`MIN_TILE_SIZE`/`MAX_TILE_SIZE`/`DEFAULT_TILE_SIZE`/`ZOOM_STEP`, `zoomIn`/`zoomOut`, persistência via `city-zoom-storage.ts`), mas sem UI própria por enquanto — expor esse ajuste pro jogador fica pra um futuro menu de configurações (ver [[../ui-ux/settings-menu]]). Como o cache do LOWYS é indexado por coordenada de chunk (não por pixel), mudar `tileSize` não invalida o cache nem dispara novas buscas.

### Prédios seguem a mesma regra dos tiles

Qualquer visual mais pesado associado a um lote (fachada personalizada, prédio — ver [[../roadmap/03-cidade-e-lar/planos/04-personalizacao-de-lote]], ainda não implementado) deve ser amarrado ao chunk do tile onde o lote está — monta/desmonta junto com o chunk, sem ciclo de vida próprio. `CityGrid.controller.ts#buildChunkTiles` é o lugar natural pra incluir esse dado quando o lote ganhar personalização de verdade.

## Observações

Resolvido nesta implementação:

- Tamanho do chunk: **10×10 tiles**.
- Margem de buffer: **`640px`** (`rootMargin` do `IntersectionObserver`).
- Política de cache: nunca expira dentro da sessão (sem LRU) — aceito como v1.
- Mecanismo de visibilidade: `IntersectionObserver` único e compartilhado, não uma biblioteca de virtualização genérica nem inversão manual de scroll.
- Formato do endpoint: um chunk por chamada (`GET /city/chunks/:x/:y`) — o frontend dispara uma chamada por chunk que entra na margem, sem batching. Simples de implementar/testar; se round-trips virarem gargalo com chunks menores/margens maiores, um endpoint em lote é o próximo passo natural.
- Camada do recorte por região: `GetCityChunkUseCase`, no bounded context `city`, mesmo padrão dos outros use-cases (`Promise.all` do `CityMap` + lotes).

Ainda não definidos (**Pendente** — trade-offs de produto/operação, não de implementação):

- Como (ou se) o cache do client é invalidado quando outro jogador reivindica/personaliza um lote num chunk já cacheado — hoje não existe nenhum mecanismo de invalidação; o polling já existente no jogo (ver [[simulation-tick]]) só cobre o personagem do próprio jogador, não a cidade. Sem infraestrutura de tempo real (ver [[../decisions/0004-sem-chat-em-tempo-real]]), fica fora de escopo por enquanto.
- Se a política de cache "nunca expira" continua aceitável quando a cidade crescer bastante (decisão 0027) e sessões longas rolarem uma área muito maior — um limite/LRU pode virar necessário.
- LOWYS **não reduz o total de bytes transferidos** numa sessão que rola o mapa inteiro (16 chunks ≈ mesma soma de tiles do antigo `GET /city`, com overhead de 16 requisições HTTP a mais) — o ganho é custo de pico/DOM montado a qualquer momento, não tráfego agregado.

## Referências

- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[api/city/endpoints]]
- [[../roadmap/03-cidade-e-lar/planos/04-personalizacao-de-lote]]
- [[../roadmap/03-cidade-e-lar/planos/07-lowys-carregamento-em-chunks]]
- [[../ui-ux/settings-menu]]
