# Plano — Empregos públicos e hierarquia de cargos

## Status

⏳ Pendente — substitui o plano anterior deste slot ("Atividade Estudar", descartado — ver [[../../../game-design/skills-and-study]]). Trabalho passa a ser o próximo grande marco do jogo, não Estudo.

## Objetivo técnico

Dar estrutura de verdade ao trabalho: hoje `working` é uma atividade genérica com taxa fixa (`RATES_PER_MINUTE.working.money`) — este plano introduz empregos públicos concretos (prédio + cargo), cuja eficiência depende das skills do personagem, e progressão de carreira (promoção de cargo) baseada em eficiência acumulada ao longo do tempo trabalhado. Ver [[../../../game-design/jobs]] pro desenho completo.

## Escopo

- Catálogo de prédios públicos e cargos, em código (TS const), seguindo o mesmo padrão de `SKILL_DEFINITIONS` (`apps/api/src/character/domain/entities/skill.ts`) — ver [[../../../game-design/jobs]], seção "Fonte de verdade".
- Cada cargo define habilidade principal (obrigatória), secundária e terciária (opcionais), e uma taxa-base de pagamento.
- Nova entidade pro prédio de trabalho (`Workplace` ou equivalente) — **não** um `Lot` (sem dono, sem as regras de posse de `Lot`; ver [[../../../game-design/jobs]] pra justificativa). Precisa de posição na grade da cidade pra aparecer visualmente.
- Personagem escolhe um emprego (prédio + entra no primeiro cargo da hierarquia) como parte da atividade `working` — `ChangeActivityDto` precisa saber qual emprego/cargo, análogo a como o estudo precisaria saber qual skill (ideia descartada, mas o mecanismo de "atividade com alvo" continua válido).
- Cálculo de eficiência (combinação ponderada das skills do cargo atual) substituindo a taxa fixa de `working.money`.
- Acúmulo de "score de progresso" por cargo (eficiência × tempo trabalhado) e promoção automática pro próximo cargo da hierarquia quando o score cruza o threshold do cargo — verificado no mesmo recompute/tick que já processa os demais efeitos de atividade.
- UI: escolher o emprego/prédio, ver o cargo atual, a eficiência atual, e o progresso até a próxima promoção.

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts`, `character.entity.ts` (novo formato de `working` com alvo de emprego/cargo)
- `apps/api/src/character/presentation/dto/change-activity.dto.ts`
- Novo bounded context ou entidade dentro de `city` pro catálogo de prédios/cargos e pra persistir o cargo atual de cada personagem
- `apps/game/src/pages/home/hud/` (UI de escolha de emprego e progresso de carreira)

## Depende de

Nenhuma dependência técnica dura — o catálogo de skills (M01) e o motor de simulação (M01, plano 06) já são suficientes pra implementar o mecanismo. Recomendado detalhar a estrutura de dados (catálogo de prédios/cargos) antes de implementar, já que isso ainda não está fechado como decisão.

## Referências

- [[../../../game-design/jobs]]
- [[../../../game-design/skills-and-study]]
- [[../../../game-design/character-needs]]
- [[../../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../../01-fundacao-e-personagem/planos/06-motor-de-simulacao-wryd]]
- [[../../01-fundacao-e-personagem/planos/07-skills-catalogo-e-balanceamento]]
