# Plano — LOWYS: carregamento em chunks da cidade

## Status

✅ Feito. Backend (`chunk.ts`, `GetCityChunkUseCase`, `GET /city/chunks/:x/:y`) e frontend (`CityGrid.controller.ts` + `CityGrid.tsx`, cache + `IntersectionObserver`) implementados e testados (100% de cobertura nos dois lados). Detalhes em [[../../../technical/lowys-carregamento-em-chunks]]. `packages/luv-ui` não precisou mudar — o item "Onde no código" sobre `IsoGrid` abaixo não se aplicou.

## Objetivo técnico

`GET /city` hoje devolve a grade inteira numa chamada só, e o frontend monta um elemento DOM por tile sempre, esteja ele visível ou não (ver [[../../../technical/lowys-carregamento-em-chunks]]). Isso não escala conforme a cidade cresce — tanto em payload de rede quanto em custo de render — e piora quando lotes personalizados (plano 04) trouxerem DOM próprio por lote (prédios/fachadas). LOWYS (Load Only What You See) resolve isso carregando e renderizando só o que está (ou pode ficar, com uma margem pequena) visível pro jogador.

## Escopo

- Backend: recorte por chunk no bounded context `city` — endpoint(s) que devolvem só os tiles/lotes de uma região da grade, em vez da cidade inteira.
- Frontend: janela de render (só monta `Block` pros chunks visíveis + margem) e cache local de chunks já buscados — rolar pra trás não repete chamada de rede.
- Prédios/fachadas de lotes personalizados (plano 04) seguem o ciclo de vida do chunk do seu tile.

## Fora do escopo

- Mudar o algoritmo de geração do terreno (`generate-city-map.ts`) — LOWYS é só sobre como o terreno já gerado é lido/entregue/renderizado, não sobre como ele é criado.
- Invalidação de cache entre jogadores (ex.: ver em tempo real quando outro jogador reivindica um lote num chunk que já está no seu cache) — pendente, ver Observações do documento técnico.

## Onde no código

- `apps/api/src/city/domain/entities/chunk.ts`, `application/use-cases/get-city-chunk.use-case.ts` (recorte por chunk, sobre a mesma persistência já existente)
- `apps/game/src/pages/home/CityGrid.controller.ts` (cache + janela de render), `CityGrid.tsx` (placeholders + `IntersectionObserver` + render dos `Block`)
- `packages/luv-ui` não mudou — `CityGrid` usa `Block`/`TILE_TYPES` direto, sem tocar em `IsoGrid`.

## Depende de

- Terreno gerado e persistido (ver [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]) — já feito, é a base que torna o recorte por chunk possível sem mudar a geração.
- Cidade isométrica no jogo (plano 01) — já feito, é o que este plano otimiza.

## Referências

- [[../../../technical/lowys-carregamento-em-chunks]]
- [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../../../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[04-personalizacao-de-lote]]
