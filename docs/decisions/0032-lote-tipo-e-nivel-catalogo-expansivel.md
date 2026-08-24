# 0032 — Lote: catálogo fechado de Tipos expansível, com até 10 níveis unificando estética e mecânica

## Contexto

[[../game-design/lots-and-construction]] já proibia construção manual livre ("nunca utilizar sistemas complexos de construção manual"), mas não definia como esse catálogo fechado se estrutura, nem como personalização visual (plano 04) e evolução mecânica (plano 05) se relacionam entre si. Hoje os dois planos tratam isso como sistemas paralelos e independentes — o plano 04 chega a dizer "diferente da evolução mecânica (plano 05)... este plano é sobre a aparência" — sem nenhuma ligação formal entre subir de nível e mudar de aparência.

A alternativa considerada era deixar o jogador montar o lote peça por peça (paredes, portas, janelas escolhidas livremente, com expansão vertical em formato de prédio). Essa rota daria mais liberdade de expressão, mas exigiria um sistema de composição em camadas que não existe em nenhum lugar do pipeline de arte atual (hoje é um sprite isométrico único, pré-desenhado, por tile — sem rotação/composição em runtime), um salto de escopo desproporcional ao resto do jogo.

## Decisão

1. **Catálogo fechado de Tipos, nunca construção livre.** Cada lote tem um **Tipo** — um preset visual e mecânico completo (ex.: "Loja de Móveis", "Marcenaria", "Sobrado") — escolhido de um catálogo fechado. Reforça [[../game-design/lots-and-construction]]: o jogador nunca monta um lote peça por peça.
2. **Hierarquia de subtipos.** Lote **Privado** (do jogador, como oposto aos prédios públicos — ver [[../game-design/lots-and-construction]] seção "Prédios públicos") → **macro-categoria** (Residencial / Comercial / Industrial, já existente — ver [[0006-um-lote-de-cada-tipo-por-jogador]]) → **Tipo concreto** dentro daquela categoria (ex.: Privado → Comercial → Loja de Móveis; Privado → Industrial → Marcenaria; Privado → Residencial → Sobrado). Cada Tipo concreto tem um identificador próprio.
3. **O catálogo é expansível por regra de design, não só por capacidade técnica.** Novos Tipos DEVEM ser adicionados ao longo do tempo — o objetivo explícito é reduzir a repetição visual pela cidade conforme o jogo cresce. Não é "um catálogo fechado de uma vez por todas"; é fechado a cada momento, mas o sistema (dados, schema, pipeline de arte) precisa suportar crescimento horizontal contínuo sem retrabalho estrutural.
4. **Até 10 níveis de evolução por Tipo, unificando estética e mecânica.** Subir de nível melhora, no mesmo passo, a aparência do preset (fachada mais elaborada, por exemplo) E a mecânica interna (lucro, novos cargos disponíveis etc. — efeito exato de cada mecânica é decisão de game design a fechar por macro-categoria quando M07/empresas existir). Não são dois eixos de progressão paralelos (visual vs. funcional) — é um eixo só.
5. **Identidade de um lote = par (Tipo, Nível).** Ex.: "Tipo Sobrado, nível 10" determina, sozinho, tanto a renderização quanto o estado mecânico do lote — não há combinação livre entre aparência e nível de outro Tipo.

## Justificativa

O mesmo trade-off de sempre entre liberdade do jogador e coerência/custo de produção, resolvido a favor de coerência: um catálogo com poucas dezenas de Tipos bem desenhados, cada um reconhecível (casa não vira cara de apartamento, oficina é realmente oficina), é mais barato de manter e mais consistente visualmente do que um editor livre — mas só funciona se o catálogo não estagnar, daí a regra 3 ser um requisito de design, não um "seria bom": sem crescimento contínuo de Tipos, a cidade inteira acaba repetindo os mesmos poucos modelos.

Unificar estética e mecânica no mesmo nível (regra 4) evita manter dois sistemas de progressão desalinhados (jogador em nível visual 3 mas nível mecânico 7, por exemplo) e simplifica tanto a UI (uma barra de progresso, não duas) quanto o catálogo de dados (uma entrada por Tipo+Nível cobre os dois aspectos).

## Consequências

- Os planos [[../roadmap/03-cidade-e-lar/planos/04-personalizacao-de-lote]] (aparência) e [[../roadmap/03-cidade-e-lar/planos/05-evolucao-do-lote]] (mecânica) deixam de ser sistemas independentes — passam a ser as duas metades do mesmo catálogo de Tipo+Nível, reconciliados por esta decisão.
- `Lot` (backend, `apps/api/src/city/domain/entities/lot.entity.ts`) precisa de campos de subtipo (Tipo) e nível além do `type` atual (que hoje só representa a macro-categoria) — schema exato a fechar durante a implementação dos planos 04/05.
- A estrutura Tipo/Nível é desenhada aqui pra residencial, comercial e industrial juntos, mesmo M03 só cobrindo lote residencial hoje (comercial/industrial dependem de empresas — M07, ver `docs/roadmap/03-cidade-e-lar/descricao.md` "Fora do escopo"). Comercial/industrial reaproveitam o mesmo modelo quando M07 chegar, em vez de desenhar um sistema novo.
- Adicionar Tipos novos vira trabalho de conteúdo recorrente (arte + dados), não uma feature que "termina" — precisa entrar no planejamento contínuo do jogo, não só na implementação inicial dos planos 04/05.

## Referências

- [[../game-design/lots-and-construction]]
- [[../roadmap/03-cidade-e-lar/planos/04-personalizacao-de-lote]]
- [[../roadmap/03-cidade-e-lar/planos/05-evolucao-do-lote]]
- [[0006-um-lote-de-cada-tipo-por-jogador]]
- [[0019-personagem-montado-em-camadas-com-rig-2d]]
