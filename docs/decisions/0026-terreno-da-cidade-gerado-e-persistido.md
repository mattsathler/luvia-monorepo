# 0026 — Terreno da cidade é gerado uma vez e persistido, não "grama por padrão"

## Contexto

O bounded context `city` ([[0025-home-e-a-tela-da-cidade]]) tratava tudo que não fosse um `Lot` como grama — sem noção real de terreno. Isso não sustenta o design de [[../game-design/city-and-world]]: a cidade precisa de ruas que se conectam em cruzamentos, água (rios/lagos) e pontos de interesse (prédios públicos), e jogadores só devem poder reivindicar lotes residenciais sobre terreno livre de verdade (grama), não em qualquer célula do retângulo.

Havia dados de dev pré-existentes no cluster MongoDB Atlas (pelo menos 1 `Lot` real, reivindicado pela lógica antiga de "qualquer célula livre do retângulo").

## Decisão

1. **O terreno é gerado por um algoritmo puro e determinístico** (`apps/api/src/city/domain/entities/`: `generate-borders.ts`, `generate-roads.ts`, `generate-water-features.ts`, `generate-landmarks.ts`, orquestrados por `city-map.entity.ts#CityMap.generate`), sem `Math.random()` — features orgânicas (rio, lago, jitter de pontos de interesse) usam um hash 2D seedado (`hash-noise.ts`). Mesma entrada sempre produz a mesma cidade.
2. **Água sobrescreve estrada e grama onde se cruzarem** — sem pontes nesta versão; um rio simplesmente interrompe a rua nas duas margens.
3. **Só terreno `grass` é reivindicável como lote** (`isBuildableTerrain`). `findFreeBuildablePosition` (substituindo o antigo `findFreePosition`) só considera tiles `grass` livres — é a correção direta do bug que gerou o dado inconsistente no Atlas.
4. **Persistência: documento único (singleton)**, collection `city_maps`, chave fixa `'default'` — existe uma cidade só ([[0005-cidade-unica-persistente]]) e o terreno não muda depois de gerado nesta milestone. Gerado sob demanda na primeira leitura (`GetOrGenerateCityMapUseCase`, compartilhado por `GetCityUseCase` e `GetCharacterLotUseCase`), mesmo padrão de efeito colateral em leitura já usado por `RecomputeCharacterUseCase` — mas sem o controle de concorrência otimista dele, porque a geração é pura: qualquer corrida entre leituras concorrentes computa exatamente o mesmo resultado.
5. **Tamanho da cidade sobe de 20×20 para 40×40** — mesmo valor já validado visualmente em `apps/docs/src/city/City.tsx`; 20×20 não deixava interior suficiente pra estrada+água+pontos de interesse+lotes depois da borda de oceano/praia.
6. **`CITY_SEED`/`CITY_WIDTH`/`CITY_HEIGHT` como versão do terreno**: se o documento salvo não bate com esses valores no código, `GetOrGenerateCityMapUseCase` regenera e persiste de novo automaticamente — uma rede de segurança pra dev, não pra uso displicente em produção (ver Consequências).
7. **Reset, não migração**: os dados de dev pré-existentes no Atlas (lotes reivindicados pela lógica antiga) foram apagados manualmente em vez de migrados — ainda pré-lançamento, sem jogadores reais.

## Consequências

- Nenhum lote (novo ou existente) pode mais ser reivindicado fora de um tile `grass`.
- Trocar `CITY_SEED` depois do lançamento sem também limpar a coleção `lots` reproduz exatamente o bug que esta decisão corrige — lotes antigos apontariam pra coordenadas que não são mais `grass` no terreno recém-gerado. Qualquer mudança de seed pós-lançamento precisa vir acompanhada de um reset/migração de `lots`.
- Cruzamentos em T/esquina reaproveitam o sprite de cruzamento completo (`road-i`) — não existe sprite dedicado pra eles.
- `packages/luv-ui` ganhou um tile `landmark` (reaproveita a textura de `grass` com tingimento próprio, mesma técnica de `lot`/`lot-mine`) — nenhum asset novo foi necessário.
- `apps/docs/src/city/ExampleCity.ts` (showcase do design system) não foi alterado — não depende do backend, fica fora de escopo.

## Referências

- [[../game-design/city-and-world]]
- [[../game-design/lots-and-construction]]
- [[0005-cidade-unica-persistente]]
- [[0006-um-lote-de-cada-tipo-por-jogador]]
- [[0025-home-e-a-tela-da-cidade]]
- [[../technical/api/city/endpoints]]
