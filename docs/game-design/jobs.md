# Trabalho

## Objetivo

Definir os tipos de emprego disponíveis para o jogador, e como o personagem progride dentro de um emprego.

## Decisões consolidadas

Existem dois tipos de trabalho.

### Público

- Fornecido pela cidade (prédios do governo — ver "Estrutura" abaixo).
- Sempre disponível.
- Baixo salário.
- Seguro.
- **Primeira fase a ser implementada** (ver [[../roadmap/02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]]).

### Empresas de jogadores

- Criadas pelos próprios jogadores
- Podem pagar mais
- Dependem da economia
- Fora de escopo por enquanto — ver [[companies]] e a M07 (Economia de Jogadores).

## Estrutura de um emprego público

```
Prédio → Hierarquia de Cargo → Habilidade Principal → Habilidade Secundária (opcional) → Habilidade Terciária (opcional)
```

- **Prédio**: um local de trabalho do governo (ex.: Prefeitura, Escola Municipal, Hospital Público). Diferente de [[lots-and-construction]]: um prédio de trabalho **não pertence a nenhum jogador** — é infraestrutura fixa da cidade, sem as regras de posse que já existem pra `Lot` (1 residencial/comercial/industrial por jogador). Precisa de posição na grade da cidade pra aparecer visualmente, mas não deveria ser modelado como um `Lot` — as invariantes de posse do `Lot` (dono único, 1 por tipo) não fazem sentido pra algo que não tem dono. Recomendação: entidade própria (`Workplace` ou equivalente), possivelmente dentro do bounded context `city` (compartilha a grade), mas sem o campo `characterId` obrigatório que `Lot` tem hoje. Prédios marcados como obrigatórios neste catálogo são replicados em **todo Bairro** gerado (ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]) — um jogador num bairro novo tem acesso aos mesmos empregos públicos que um jogador do bairro original, sem precisar viajar até lá.
- **Hierarquia de Cargo**: cada Prédio tem uma lista **ordenada** de cargos (ex.: Estagiário → Assistente → Analista → Coordenador → Gerente). Um personagem começa no primeiro cargo da lista e sobe conforme o critério de promoção (abaixo).
- **Habilidade Principal / Secundária / Terciária**: cada Cargo (não o Prédio inteiro) define até 3 skills do catálogo existente (`SKILL_DEFINITIONS`) que importam pra ele, em ordem de peso — principal obrigatória, secundária e terciária opcionais. Cargos diferentes do mesmo prédio podem exigir skills diferentes (ex.: "Atendente" pesa Carisma; "Coordenador" do mesmo prédio pesa Inteligência).

## Eficiência

Eficiência é uma combinação ponderada dos pontos do personagem nas skills do cargo atual, dando mais peso à principal do que à secundária, e mais à secundária do que à terciária — proposta inicial (placeholder, a balancear como qualquer taxa de efeito do jogo):

```
eficiência = 0.6 × principal + 0.25 × secundária + 0.15 × terciária
```

(skills não presentes no cargo — ex.: sem terciária — não entram na conta; os pesos das presentes se normalizam.)

### Distância importa

Trabalhar longe de casa custa produtividade — a eficiência final também é multiplicada por um fator de distância entre o lote residencial e o prédio de trabalho:

```
eficiência_final = eficiência_skills × fator_distância
fator_distância  = max(piso, 1 − distância_em_bairros × penalidade_por_bairro)
```

Distância medida em **bairros de distância** (0 = mesmo Bairro do lote residencial, 1 = Bairro vizinho no anel adjacente, e assim por diante — ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]]), não em tiles: é a unidade que já organiza o mundo, e alinha a fórmula à garantia de justiça abaixo. `penalidade_por_bairro` e `piso` (mínimo — nunca zero, Cozy First: nenhuma escolha de trabalho vira inviável, só menos vantajosa) são placeholders a balancear, como qualquer taxa do jogo.

**A justiça entre jogadores não vem de zerar esse efeito — vem de todo Bairro ter os mesmos prédios públicos obrigatórios.** Trabalhar no prédio do próprio Bairro (distância 0) sempre dá o fator máximo, e todo jogador — não importa há quanto tempo entrou nem quão longe do Bairro original seu Bairro está — tem essa opção de distância 0 disponível. Trabalhar mais longe (ex.: perseguir um cargo específico que só existe num prédio distante) é uma escolha real do jogador, com um custo real, não uma consequência de ter entrado tarde. Ver [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]].

A eficiência final multiplica a taxa de ganho (dinheiro/hora) do trabalho — dois personagens no mesmo cargo, morando à mesma distância, ganham taxas diferentes conforme suas skills; o mesmo personagem no mesmo cargo ganha menos se escolher um prédio mais longe. Isso substitui a taxa fixa de `working` que existe hoje (`RATES_PER_MINUTE.working.money`).

## Promoção

Promoção depende de **eficiência acumulada ao longo do tempo trabalhado** ("presença"), não só de um valor instantâneo — um personagem eficiente mas que mal trabalhou não deveria subir de cargo mais rápido que um menos eficiente que trabalhou muito. Proposta de mecanismo:

- Cada cargo acumula um "score de progresso" enquanto o personagem trabalha nele: a cada intervalo de recompute, `score += eficiência_no_intervalo × minutos_trabalhados`.
- Cada cargo define um `scoreParaPromover` (threshold, valor de game design a fechar por cargo/prédio).
- Quando o score acumulado cruza o threshold, o personagem é promovido automaticamente pro próximo cargo da hierarquia (score zera e recomeça no cargo novo) — verificado no mesmo recompute/tick que já processa os outros efeitos de atividade (ver [[../technical/simulation-tick]]), sem precisar de um scheduler novo.
- Último cargo da hierarquia não promove mais (fim de carreira naquele prédio).

## Fonte de verdade / catálogo

Recomendação: catálogo em **código** (TS const), seguindo exatamente o mesmo padrão já usado pelo catálogo de skills (`SKILL_DEFINITIONS` em `apps/api/src/character/domain/entities/skill.ts`) — não banco de dados, não um JSON carregado em runtime. Motivos:

- É o padrão já estabelecido no projeto pra esse tipo de dado: curado pelo game design, pequeno, muda via deploy (novo prédio/cargo = nova entrada no array + PR), não em runtime.
- Type-safety de graça — skill ids de cada cargo validados em compile-time contra `SKILL_IDS`, sem precisar de validação adicional em request nenhuma.
- Nenhuma migração de schema quando um prédio ou cargo novo é adicionado.
- Banco de dados só faria sentido se jogadores (ou moderadores) pudessem criar prédios/cargos em runtime — não é o caso: prédios do governo são fixos, definidos pelo game design, igual ao catálogo de skills já é.

## Fora de escopo (nesta fase)

- Empresas de jogadores e empregos privados (ver [[companies]] — isso é M07).
- Múltiplos empregos simultâneos por personagem.
- Demissão / desligamento voluntário de um cargo (assume-se que o jogador troca de atividade quando quiser parar — não existe um estado "desempregado" distinto de "Ocioso").
- Prédios comerciais/industriais como local de trabalho — isso depende de empresas (M07); nesta fase só prédios do governo existem como locais de trabalho.

## Referências

- [[companies]]
- [[economy]]
- [[skills-and-study]]
- [[character-needs]]
- [[lots-and-construction]]
- [[../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]] (produtividade também depende de energia/felicidade, não só eficiência de skill)
- [[../decisions/0031-bairros-expansao-do-mundo-sob-demanda]] (prédios obrigatórios replicados por Bairro; distância importa, mas nunca falta uma opção de distância 0)
- [[../roadmap/02-loop-de-vida-wryd/planos/04-empregos-publicos-e-hierarquia-de-cargos]]
- [[../roadmap/03-cidade-e-lar/planos/10-bairros-e-expansao-do-mundo]]
