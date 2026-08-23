# Plano — Empregos públicos e hierarquia de cargos

## Status

🔄 Backend concluído (mecanismo + catálogo de conteúdo), frontend pendente — substitui o plano anterior deste slot ("Atividade Estudar", descartado — ver [[../../../game-design/skills-and-study]]). Trabalho passa a ser o próximo grande marco do jogo, não Estudo.

Todo o backend foi implementado num novo bounded context `employment` (não dentro de `city`, como a seção "Onde no código" original previa — ver correção abaixo): catálogo de prédios/cargos, entidade `Contract` com cálculo de eficiência e promoção automática, persistência Mongo, scheduler de tick, e endpoints `POST`/`GET /employment/characters/:characterId/contract`. O catálogo cresceu de 1 prédio de exemplo (Prefeitura) pra 8 prédios públicos (Prefeitura, Hospital Municipal, Delegacia de Polícia, Guarda Municipal, Secretaria de Obras Públicas, Oficina Municipal de Metalurgia, Secretaria da Fazenda, Escola Municipal), cada um com sua hierarquia de 3-6 cargos — ver [[../../../game-design/jobs]]. Promoção agora respeita vagas limitadas por instância de prédio (`vacancySlots` no catálogo — cargo de entrada continua sempre ilimitado); sem vaga livre, o personagem fica represado no cargo atual sem perder score. 100% de cobertura em `apps/api` e `tsc -b` limpo. Falta: toda a UI (escolher emprego, ver cargo/eficiência/progresso), e a verificação manual ponta a ponta contra o Atlas de dev (rodar `npm run city:seed-workplaces` com os 8 prédios).

## Objetivo técnico

Dar estrutura de verdade ao trabalho: hoje `working` é uma atividade genérica com taxa fixa (`RATES_PER_MINUTE.working.money`) — este plano introduz empregos públicos concretos (prédio + cargo), cuja eficiência depende das skills do personagem, e progressão de carreira (promoção de cargo) baseada em eficiência acumulada ao longo do tempo trabalhado. Ver [[../../../game-design/jobs]] pro desenho completo.

## Escopo

- Catálogo de prédios públicos e cargos, em código (TS const), seguindo o mesmo padrão de `SKILL_DEFINITIONS` (`apps/api/src/character/domain/entities/skill.ts`) — ver [[../../../game-design/jobs]], seção "Fonte de verdade".
- Cada cargo define habilidade principal (obrigatória), secundária e terciária (opcionais), e uma taxa-base de pagamento.
- Nova entidade pro prédio de trabalho (`Workplace` ou equivalente) — **não** um `Lot` (sem dono, sem as regras de posse de `Lot`; ver [[../../../game-design/jobs]] pra justificativa). Precisa de posição na grade da cidade pra aparecer visualmente.
- Personagem escolhe um emprego (prédio + entra no primeiro cargo da hierarquia) como parte da atividade `working` — `ChangeActivityDto` precisa saber qual emprego/cargo, análogo a como o estudo precisaria saber qual skill (ideia descartada, mas o mecanismo de "atividade com alvo" continua válido).
- Cálculo de eficiência (combinação ponderada das skills do cargo atual) substituindo a taxa fixa de `working.money`.
- Acúmulo de "score de progresso" por cargo (eficiência × tempo trabalhado) e promoção pro próximo cargo da hierarquia quando o score cruza o threshold do cargo **e há vaga livre** (`vacancySlots`, contada por instância de `Workplace`) — verificado no mesmo recompute/tick que já processa os demais efeitos de atividade; sem vaga, o personagem fica represado no cargo atual, sem perder score.
- UI: escolher o emprego/prédio, ver o cargo atual, a eficiência atual, e o progresso até a próxima promoção.

## Onde no código

Implementado — divisão real ficou diferente da prevista originalmente (catálogo + `Contract` viraram um bounded context próprio, não uma entidade dentro de `city`; `city` só ganhou o prédio físico, sem saber de cargos/salário):

- `apps/api/src/character/domain/entities/activity.ts` — `working` perdeu a taxa fixa de dinheiro (`RATES_PER_MINUTE.working`), agora só custa energia; dinheiro vem do `Contract`.
- `apps/api/src/character/domain/entities/character.entity.ts` — novo método `credit()`; `apps/api/src/character/application/use-cases/credit-money.use-case.ts` (`CreditCharacterMoneyUseCase`, único jeito de outro bounded context mexer em dinheiro).
- `apps/api/src/city/domain/entities/workplace.entity.ts` — prédio de trabalho físico (sem dono, sem regras de posse de `Lot`), com repositório e persistência Mongo próprios; incluído em `GET /city/chunks/:x/:y`. Seed manual via `npm run city:seed-workplaces`.
- `apps/api/src/employment/` (novo bounded context, importa `CharacterModule` e `CityModule`, nunca o contrário):
  - `domain/entities/building-catalog.ts` — catálogo Prédio → Cargo → habilidade principal/secundária/terciária → salário-base → threshold de promoção → `vacancySlots` (TS const, mesmo padrão de `SKILL_DEFINITIONS`); 8 prédios, 3-6 cargos cada.
  - `domain/entities/efficiency.ts` — eficiência = skills ponderadas (0.6/0.25/0.15) × fator de distância (placeholder: tile cru, piso 0.4 — a trocar por distância em Bairro quando [[../../../decisions/0031-bairros-expansao-do-mundo-sob-demanda]] for implementado).
  - `domain/entities/contract.entity.ts` — `Contract` (salário/hora próprio do contrato, horas trabalhadas e score de progresso acumulados *por cargo*). `recomputeUntil` só sinaliza elegibilidade de promoção (`isPromotionEligible()`/`promotionEligible`); quem decide se aplica (`promote()`) é o use-case, depois de checar vaga.
  - `application/use-cases/{start-contract,recompute-contract,get-contract}.use-case.ts` — `RecomputeContractUseCase` checa `ContractRepository.countActiveByWorkplaceAndCargo` contra `vacancySlots` do próximo cargo antes de promover — `+ infrastructure/scheduling/contract-tick.scheduler.ts` (tick em lote, separado do de `character` de propósito) + persistência Mongo (upsert por `characterId`, CAS por `contractId`).
  - `presentation/employment.controller.ts` — `POST`/`GET /employment/characters/:characterId/contract`.
- **Pendente**: `apps/game/src/pages/home/hud/` (UI de escolha de emprego e progresso de carreira) — nenhum trabalho de frontend foi feito ainda.

## Depende de

Nenhuma dependência técnica dura — o catálogo de skills (M01) e o motor de simulação (M01, plano 06) já são suficientes pra implementar o mecanismo. Recomendado detalhar a estrutura de dados (catálogo de prédios/cargos) antes de implementar, já que isso ainda não está fechado como decisão.

## Referências

- [[../../../game-design/jobs]]
- [[../../../game-design/skills-and-study]]
- [[../../../game-design/character-needs]]
- [[../../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
- [[../../01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]
