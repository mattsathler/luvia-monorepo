# Plano — Bairros e expansão do mundo

## Status

⏳ Pendente — adicionado depois da primeira versão desta milestone: Luvia não é só uma cidade, é um mundo, e vagas residenciais finitas eventualmente lotam conforme jogadores entram. Ver [[../../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]] e [[../../../technical/bairros-e-expansao-do-mundo]] pro desenho completo.

## Objetivo técnico

Fazer o mundo crescer sob demanda em unidades de **Bairro** — cada um replicando a mesma infraestrutura pública (prédios obrigatórios do catálogo de [[../../../game-design/jobs]]) e um lote de terrenos residenciais vazios — em vez de uma grade fixa que eventualmente esgota. Sem isso, `findFreeBuildablePosition` simplesmente falha (`ConflictException`) quando a cidade lota.

## Escopo

- Migrar a persistência de `city_maps` (documento singleton, grade fixa) pra uma coleção de Bairros, cada um com sua própria origem/offset na grade global do mundo.
- Reativar e reescrever `generate-landmarks.ts` pra operar por Bairro (não pela grade inteira) e usar tipos concretos de prédio do catálogo de `Workplace` (ver [[../../02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]]) em vez do tile `landmark` genérico atual.
- Layout de Bairros em anéis concêntricos ao redor do Bairro original (`0:0`).
- Gatilho de expansão: quando nenhum Bairro já gerado tem vaga residencial livre, gerar o próximo Bairro do próximo anel sob demanda (mesmo padrão de "gerar na primeira leitura" que `GetOrGenerateCityMapUseCase` já usa hoje).
- `GetCityChunkUseCase` (LOWYS) resolve a que Bairro uma coordenada de chunk pertence, em vez de assumir uma grade fixa.
- Garantir (documentar + testar) que a eficiência de trabalho inclui o fator de distância em bairros (ver [[../../../game-design/jobs]]), e que trabalhar no próprio Bairro (distância 0) nunca sofre desconto — é isso que impede desvantagem sistêmica por morar longe do Bairro original, não a ausência do efeito.

## Onde no código

- `apps/api/src/city/domain/entities/city-map.entity.ts`, `generate-city-map.ts`, `generate-landmarks.ts`
- `apps/api/src/city/infrastructure/persistence/city-map.schema.ts`/`.mongo.repository.ts` (singleton → coleção)
- `apps/api/src/city/application/use-cases/get-or-generate-city-map.use-case.ts`, `get-city-chunk.use-case.ts`, `get-character-lot.use-case.ts`

## Depende de

- Empregos públicos e hierarquia de cargos (M02, plano 04) — precisa do catálogo de `Workplace`/prédios obrigatórios pra saber o que replicar em cada Bairro.
- LOWYS: carregamento em chunks (plano 07, já feito) — Bairro é construído sobre a mesma unidade de chunk.

## Referências

- [[../../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]
- [[../../../technical/bairros-e-expansao-do-mundo]]
- [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../../../decisions/0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[../../../game-design/city-and-world]]
- [[../../../game-design/jobs]]
- [[07-lowys-carregamento-em-chunks]]
