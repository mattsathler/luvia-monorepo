# 0031 — Bairros: o mundo se expande sob demanda, e distância importa de verdade

## Contexto

A [[0027-cidade-sem-borda-fixa-e-so-com-lagoa]] já removeu a borda fixa de oceano como **preparação** pra cidade crescer dinamicamente, mas deixou isso explicitamente como trabalho futuro: "`CITY_WIDTH`/`CITY_HEIGHT` continuam fixos... se algum dia a cidade realmente crescer dinamicamente, essa decisão precisa ser revisitada." Essa hora chegou: Luvia não é só uma cidade, é um mundo — e um mundo com grade fixa (hoje 40×40, um único documento `city_maps`) tem vagas finitas de lote residencial. Conforme jogadores entram, `findFreeBuildablePosition` (varredura linha a linha) aloca posições cada vez mais longe do centro, onde ficam os prédios públicos (`generate-landmarks.ts`, hoje desativado) — sem intervenção, jogadores novos ficariam "isolados" longe de qualquer emprego/serviço público.

## Decisão

1. **O mundo cresce em unidades de Bairro (Neighbourhood), não tile a tile.** Um Bairro é uma região autocontida da grade (múltiplos chunks de 10×10 — ver [[../technical/lowys-carregamento-em-chunks]]) gerada de uma vez, com a mesma "fórmula": ruas, prédios públicos obrigatórios (ver [[../game-design/jobs]] — Prefeitura, Hospital etc., do catálogo de `Workplace`) e um lote de terrenos residenciais vazios prontos pra reivindicar. Todo Bairro nasce com seus próprios prédios públicos — nenhum bairro depende de "viajar" até o centro original pra ter acesso a emprego público ou serviços.
2. **Geração sob demanda, não antecipada.** O backend só gera o próximo Bairro quando a capacidade residencial livre do(s) Bairro(s) já gerados cai abaixo de um limiar (ver [[../technical/bairros-e-expansao-do-mundo]] pro mecanismo exato) — não existe um mundo "pré-gerado até o fim" esperando jogadores, na mesma linha de [[0026-terreno-da-cidade-gerado-e-persistido]] (terreno gerado sob demanda na primeira leitura), só que agora incrementalmente, bairro por bairro, em vez de tudo de uma vez.
3. **Determinístico, como todo o resto da geração de terreno.** Cada Bairro é gerado por um algoritmo puro e seedado (mesma técnica de `hash-noise.ts` já usada por lagoa/pontos de interesse) — a mesma sequência de bairros sempre produz o mesmo resultado, sem `Math.random()`.
4. **Distância entre lote residencial e local de trabalho reduz eficiência — é uma mecânica de verdade, não só cosmética.** Trabalhar longe de casa custa produtividade (ver [[../game-design/jobs]], seção Eficiência — fator de distância multiplicando a eficiência de skill). Isso é deliberado: distância importa, dá peso real a onde o jogador mora em relação a onde trabalha, e cria uma escolha genuína (aceitar um cargo melhor longe vs. um pior perto).
5. **A justiça entre jogadores não vem de zerar o efeito da distância — vem de todo Bairro ter os mesmos prédios públicos.** Um jogador de um Bairro novo, na ponta do mapa, tem sua própria Prefeitura/Hospital tão perto quanto o jogador do Bairro original tem da dele — a distância que importa é sempre "até o prédio mais próximo dentro do seu Bairro", não "até o prédio do Bairro original". Ninguém sai em desvantagem sistemática por ter entrado depois, porque ninguém *precisa* atravessar o mapa pra ter acesso a emprego público — quem faz isso, faz por escolha (ex.: perseguir um cargo específico), não por falta de opção.

## Justificativa

Cozy First e justiça entre jogadores: o problema concreto (vagas residenciais finitas, jogadores novos cada vez mais "longe") tem duas soluções possíveis — (a) mundo realmente infinito com geração contínua tile a tile, ou (b) mundo que cresce em blocos autossuficientes (Bairros), cada um replicando a infraestrutura pública. Optamos por (b): é mais simples de implementar sobre a arquitetura já existente (chunks já são a unidade de carregamento; Bairro é só "vários chunks gerados e servidos juntos"), e resolve o problema de percepção diretamente — um jogador num Bairro novo tem prefeitura/hospital tão perto quanto um jogador do Bairro original, não importa a que distância isso fica um do outro.

## Consequências

- **Persistência muda de singleton pra coleção.** Hoje `city_maps` é um documento único (`'default'`) com grade fixa. Isso não sustenta bairros gerados incrementalmente — vira uma coleção com um documento por Bairro (posição/offset na grade global + seus próprios tiles), e "a cidade" passa a ser a união de todos os Bairros já gerados, não um documento só. `CityMap`/`GetOrGenerateCityMapUseCase` precisam de redesenho — ver [[../technical/bairros-e-expansao-do-mundo]].
- **`generate-landmarks.ts` deixa de operar sobre a grade inteira.** Hoje ele espalha `LANDMARK_COUNT` pontos de interesse genéricos ao redor do centro de uma grade fixa. Passa a rodar **por Bairro**, sobre a área daquele bairro só, usando o catálogo de prédios obrigatórios de [[../game-design/jobs]] (tipos concretos — Prefeitura, Hospital — não mais um tile `landmark` genérico).
- **`findFreeBuildablePosition` precisa saber quando não sobra mais nada e disparar geração**, em vez de só devolver `null` (hoje isso vira `ConflictException` em `GetCharacterLotUseCase` — vira gatilho de expansão em vez de erro).
- **Layout dos Bairros entre si** (anéis concêntricos ao redor do Bairro original? grade linear?) e o **limiar exato de vagas livres que dispara o próximo Bairro** são decisões de game design/tuning a fechar durante a implementação — ver [[../technical/bairros-e-expansao-do-mundo]] pro que já está proposto vs. em aberto.
- `CITY_WIDTH`/`CITY_HEIGHT` (`city-map.entity.ts`) deixam de representar "o tamanho da cidade" (que passa a ser dinâmico) e passam a representar o tamanho de **um** Bairro.

## Referências

- [[0027-cidade-sem-borda-fixa-e-so-com-lagoa]]
- [[0026-terreno-da-cidade-gerado-e-persistido]]
- [[0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../game-design/city-and-world]]
- [[../game-design/jobs]]
- [[../technical/bairros-e-expansao-do-mundo]]
- [[../technical/lowys-carregamento-em-chunks]]
- [[../roadmap/03-cidade-e-lar/planos/10-bairros-e-expansao-do-mundo]]
