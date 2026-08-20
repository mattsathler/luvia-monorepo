# 0027 — Terreno da cidade sem borda fixa, água só como lagoa (sem rio)

## Status

⏳ A lagoa está **temporariamente desativada** (`generate-city-map.ts` não chama `generate-lake.ts#applyLake` por enquanto) — pedido explícito pra revisitar o design da água depois, com ajustes. O passe continua existindo e testado isoladamente (`generate-lake.spec.ts`); reativar é só voltar a chamá-lo antes de `placeRoads` no pipeline. `CITY_SEED` subiu pra `'luvia-city-v3'` por causa dessa mudança. O resto desta decisão (sem borda fixa, água nunca cruzada por rua quando existir) continua valendo.

## Contexto

[[0026-terreno-da-cidade-gerado-e-persistido]] introduziu o algoritmo de geração de terreno com borda de oceano/praia ao redor de toda a grade e um rio serpenteando pelo interior. Dois problemas apareceram ao revisar isso:

1. **Rio cruzando ruas sem pontes**: não modelamos pontes (nem planejamos nesta fase), então um rio atravessando a grade interrompia ruas de forma incoerente visualmente — a estrada simplesmente "sumia" no meio do rio.
2. **Borda de oceano fixa não combina com o plano de mundo**: a ideia é a cidade crescer dinamicamente conforme o número de jogadores aumenta (potencialmente sem limite fixo, "cidade infinita"). Cercar a cidade toda com oceano fixo contradiz esse plano — não faz sentido gastar ~6 tiles de cada lado com borda intransponível se a grade vai precisar crescer depois.

## Decisão

1. **Sem borda de oceano/praia.** `generate-borders.ts` foi removido — a cidade não tem mais um limite de mundo visual fixo; toda a grade (exceto lagoa/rua/ponto de interesse) começa como grama reivindicável. Isso é preparação, não implementação, do plano de "cidade infinita" — expansão dinâmica de verdade continua fora de escopo por enquanto.
2. **Água só como lagoa, sem rio.** `generate-water-features.ts` (rio + lagoa) foi substituído por `generate-lake.ts` (só lagoa, forma orgânica via ruído seedado — mesma técnica de antes, só sem a parte de rio).
3. **A lagoa nunca é cruzada por rua.** A ordem de geração muda: a lagoa agora roda **antes** das ruas (`generate-city-map.ts`, novo arquivo — ver item 4). Como `placeRoads` só desenha rua sobre tiles ainda `grass`, uma vez que a lagoa já "reservou" suas células, nenhuma rua é desenhada por cima dela — a rua simplesmente não existe onde há água, sem precisar de nenhuma lógica de desvio/pathfinding.
4. **Algoritmo isolado num arquivo próprio.** `generate-city-map.ts` (novo) contém só a orquestração pura dos passes (grama → lagoa → ruas em bruto → pontos de interesse → orientação final das ruas), sem nenhuma dependência de NestJS ou I/O. `city-map.entity.ts` delega a geração pra essa função. Isso permite rodar a geração fora do processo da API — ver item 5.
5. **Comando pra gerar um documento pronto pra colar no Atlas.** `npm run city:generate` (`apps/api/src/city/scripts/generate-city-map.script.ts`) roda o algoritmo e escreve `apps/api/generated/city-map.json` (fora do controle de versão — ver `apps/api/.gitignore`) no formato exato do documento Mongo da collection `city_maps`. O cluster de dev é ambiente de testes e pode ser alterado manualmente com frequência enquanto o design do mapa está sendo ajustado, sem precisar reiniciar a API nem esperar `GetOrGenerateCityMapUseCase` regenerar sozinho.
6. **`CITY_SEED` sobe pra `'luvia-city-v2'`** — o algoritmo mudou de forma incompatível com o formato antigo (removeu borda e rio), então o valor precisa mudar pra sinalizar isso (ver a nota operacional já registrada em [[0026-terreno-da-cidade-gerado-e-persistido]] sobre nunca trocar `CITY_SEED` sem também resetar `lots`).
7. **`TerrainKind` perde `'sand'`** — nada mais gera esse tipo (só existia pra praia da borda removida). `packages/luv-ui`'s `TILE_TYPES` mantém a entrada `sand` (design system genérico, ainda usado por `apps/docs`), só o vocabulário do backend/`apps/game` encolheu.

## Consequências

- `docs/technical/api/city/endpoints.md` precisa refletir o novo vocabulário de `type` (sem `sand`) e a garantia de que água nunca coincide com rua.
- Dados de dev no Atlas criados com o algoritmo anterior (borda+rio, `CITY_SEED` antigo) ficam obsoletos — mesmo tratamento já adotado em [[0026-terreno-da-cidade-gerado-e-persistido]]: reset, não migração, ainda pré-lançamento.
- Se algum dia a cidade realmente crescer dinamicamente (expansão de grade em runtime), essa decisão precisa ser revisitada — hoje `CITY_WIDTH`/`CITY_HEIGHT` continuam fixos, só a borda de oceano que forçava um limite visual foi removida.

## Referências

- [[0026-terreno-da-cidade-gerado-e-persistido]]
- [[../game-design/city-and-world]]
- [[../technical/api/city/endpoints]]
