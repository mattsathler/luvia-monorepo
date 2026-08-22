# Bairros e expansão do mundo

## Status

⏳ Pendente. Ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]] pra decisão de mais alto nível.

## Objetivo

Definir o mecanismo concreto pelo qual o mundo de Luvia cresce sob demanda em unidades de **Bairro**, conforme jogadores entram — garantindo que nenhum jogador saia em desvantagem sistemática por ter entrado depois (mesmo com distância afetando produtividade de verdade — ver [[../game-design/jobs]]), e sem precisar pré-gerar um mundo "infinito" de antemão.

## Contexto

Hoje (ver [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]) a cidade é **um** documento (`city_maps`, chave `'default'`), grade fixa `CITY_WIDTH × CITY_HEIGHT` (40×40), gerada uma vez e nunca mais recalculada. `findFreeBuildablePosition` varre linha a linha o primeiro tile `grass` livre — funciona hoje porque a cidade está vazia (poucos personagens de dev), mas não escala: eventualmente não sobra tile livre nenhum, e mesmo antes disso, posições alocadas vão ficando cada vez mais longe do centro (onde os prédios públicos ficariam, uma vez que [[../game-design/jobs]] reative `generate-landmarks.ts`).

## Proposta de mecanismo

### Bairro como unidade de geração

Um **Bairro** é uma região retangular de `NEIGHBOURHOOD_SIZE × NEIGHBOURHOOD_SIZE` tiles (múltiplo do tamanho do chunk LOWYS, 10×10 — ex.: um Bairro de 40×40 = 4×4 = 16 chunks, o mesmo tamanho da cidade atual) gerada de uma vez, com o mesmo pipeline já existente (`generate-city-map.ts`): grama → lagoa (quando reativada) → ruas → prédios públicos obrigatórios → orientação final das ruas. A diferença é que os "prédios públicos obrigatórios" deixam de ser um `LANDMARK_COUNT` genérico e passam a vir do catálogo de `Workplace` ([[../game-design/jobs]]) — cada Bairro recebe **1 exemplar de cada prédio marcado como obrigatório** no catálogo (ex.: 1 Prefeitura, 1 Hospital), posicionado com o mesmo algoritmo de âncora+jitter+busca-de-grama-mais-próxima que `generate-landmarks.ts` já usa, só que relativo ao centro **do Bairro**, não da cidade inteira.

### Persistência: de singleton pra coleção

`city_maps` (documento único) vira uma coleção de Bairros — cada documento guarda:

```ts
type NeighbourhoodDocument = {
  neighbourhoodId: string;      // ex.: "0:0", "1:0", "-1:1" — coordenada do Bairro na grade de bairros
  originX: number;              // offset em tiles, dentro da grade global do mundo
  originY: number;
  width: number;
  height: number;
  tiles: TerrainTile[];
  generatedAt: Date;
};
```

`CityMap`/`GetOrGenerateCityMapUseCase` deixam de representar "a" cidade e passam a agregar bairros: `GetCityChunkUseCase` (LOWYS) resolve a que Bairro uma coordenada de chunk pertence (`chunkX/chunkY` → `neighbourhoodId` via divisão inteira) e busca só o(s) Bairro(s) relevantes, não a coleção inteira — LOWYS já tolera "chunk fora da grade real devolve vazio" (hoje porque a grade é fixa; passa a significar "esse Bairro ainda não foi gerado", disparando geração em vez de devolver vazio de verdade quando fizer sentido — ver "Gatilho de expansão" abaixo).

### Layout: anéis ao redor do Bairro original

Bairros novos são posicionados em **anéis concêntricos** ao redor do Bairro original (coordenada de bairro `0:0`) — o primeiro anel tem os bairros adjacentes (`1:0`, `0:1`, `-1:0`, `0:-1`, e as diagonais se o layout for de grade cheia), o próximo anel os bairros ao redor desses, e assim sucessivamente. A ordem de preenchimento dentro de um anel (sentido horário a partir de um ponto fixo, ou por proximidade ao bairro mais cheio) é uma decisão de tuning a fechar na implementação — o importante é que a busca por bairro-com-vaga siga essa ordem, não pule anéis.

### Gatilho de expansão

Cada Bairro tem uma capacidade residencial (função do número de tiles `grass` que sobram depois de ruas/lagoa/prédios obrigatórios). Proposta de gatilho:

- `GetCharacterLotUseCase` (que já reivindica automaticamente na leitura) passa a buscar vaga livre **no Bairro com menos vagas livres já ocupadas primeiro** (preenche bairros existentes antes de abrir um novo) — mesmo espírito de `findFreeBuildablePosition`, só que escopado por Bairro em vez da grade inteira.
- Quando **nenhum Bairro já gerado** tem vaga livre, uma nova `EnsureNextNeighbourhoodUseCase` (nome provisório) gera o próximo Bairro do próximo anel, na hora, como efeito colateral dessa mesma leitura — mesmo padrão de "gerar sob demanda na primeira leitura" que `GetOrGenerateCityMapUseCase` já usa hoje, só que por Bairro em vez de pra cidade inteira.
- Alternativa mencionada no pedido original ("a cada X jogadores... geraremos uma expansão") é logicamente equivalente a isso, desde que `X ≈ capacidade residencial de um Bairro` — não precisa de um contador de jogadores separado, o "esgotou o Bairro atual" já é o sinal.
- **Concorrência**: como a geração de um Bairro é pura/determinística (mesma seed = mesmo resultado), duas leituras concorrentes que decidem gerar o próximo Bairro ao mesmo tempo computam o mesmo documento — mesmo raciocínio de "sem controle de concorrência otimista necessário" que já vale pra `GetOrGenerateCityMapUseCase` hoje. Só precisa de um `upsert` (não `insert`) na persistência do Bairro pra não duplicar se as duas leituras tentarem salvar.

### Distância importa, mas nunca falta uma opção de distância 0

A eficiência de trabalho (ver [[../game-design/jobs]]) inclui um fator de distância, medido em **bairros de distância** entre o Bairro do lote residencial e o Bairro do prédio de trabalho (0 = mesmo Bairro). Trabalhar no próprio Bairro nunca sofre esse desconto — e como todo Bairro recebe 1 exemplar de cada prédio obrigatório (seção acima), essa opção de distância 0 sempre existe, pra qualquer jogador, em qualquer Bairro, não importa há quanto tempo ele entrou. É isso que evita a desvantagem sistêmica pra jogadores de bairros mais novos — não a ausência do efeito de distância, que existe e é real (ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]], pontos 4–5).

Cálculo da distância em bairros: distância de Chebyshev entre as coordenadas de bairro (`max(|Δbairro_x|, |Δbairro_y|)`) — a mesma métrica natural de "quantos anéis de distância" já usada pro layout (seção acima), sem precisar calcular distância real em tiles entre lote e prédio.

## Em aberto (game design / tuning, não bloqueia o desenho acima)

- `NEIGHBOURHOOD_SIZE` exato (proposta: igual ao `CITY_WIDTH`/`CITY_HEIGHT` atual, 40×40, pra reaproveitar o pipeline de geração sem mudar nenhum parâmetro dele).
- Quantos prédios públicos obrigatórios por Bairro (o catálogo de [[../game-design/jobs]] pode marcar alguns prédios como "1 por Bairro" e outros como "1 a cada N Bairros", se fizer sentido pra prédios menos comuns).
- Layout exato dos anéis (grade cheia com diagonais vs. só ortogonal).
- Se bairros muito antigos e vazios (ex.: todo mundo se mudou) alguma vez são "desalocados" — fora de escopo por enquanto, mundo só cresce, nunca encolhe.

## Referências

- [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]
- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[lowys-carregamento-em-chunks]]
- [[../game-design/jobs]]
- [[../game-design/city-and-world]]
- [[../roadmap/03-cidade-e-lar/planos/10-bairros-e-expansao-do-mundo]]
