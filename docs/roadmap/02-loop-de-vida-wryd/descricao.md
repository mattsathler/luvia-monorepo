# M02 — Loop de Vida (WRYD) — MVP

## Objetivo

Tornar Luvia jogável de ponta a ponta: o jogador loga, escolhe uma atividade pro personagem, e vê o estado dele mudar sozinho com o tempo. Esta é a milestone de **MVP** — depois dela, Luvia já é um jogo, só que pequeno.

## Status

🔄 Em andamento — planos 02 concluído (via HUD), 06 parcialmente coberto. Planos 01, 03, 05 ainda não começaram, incluindo o cliente de API pra trocar de atividade (plano 01) — apesar de vir primeiro na lista, ainda está pendente. Plano 04 foi redefinido: era "Atividade Estudar", virou "Empregos públicos e hierarquia de cargos" — Estudar foi descartado como próximo marco (ver [[../../game-design/skills-and-study]]); Trabalho assume esse lugar. O backend do plano 04 já está concluído (catálogo de prédios/cargos, `Workplace`, bounded context `employment` com `Contract`, eficiência e promoção automática — ver [[planos/04-empregos-publicos-e-hierarquia-de-cargos]]); falta a UI de emprego, que depende dos planos 01/03 (seletor de atividade e cliente de API).

## Planos

1. [[planos/01-cliente-de-api-para-atividade]] — ⏳ Pendente
2. [[planos/02-dashboard-de-necessidades]] — ✅ Concluído
3. [[planos/03-seletor-de-atividade]] — ⏳ Pendente
4. [[planos/04-empregos-publicos-e-hierarquia-de-cargos]] — 🔄 Backend concluído, frontend pendente
5. [[planos/05-polling-de-estado]] — ⏳ Pendente
6. [[planos/06-indicador-de-fama]] — ⏳ Pendente (parcial)

## Escopo

- **Dashboard funcional** substituindo o placeholder atual de `HomePage`: mostra felicidade, energia, dinheiro e fama do personagem (ver [[../../game-design/character-needs]]). ✅ Concluído — entregue como HUD sobre o mapa da cidade (`ProfilePanel.tsx`), não como tela separada (ver plano 02).
- **Seletor de atividade** (ver [[../../game-design/wryd-activity-system]]): jogador escolhe entre Ocioso, Descansar e Trabalhar (emprego público — ver [[../../game-design/jobs]]). Estudar sai da lista desta milestone (mecanismo descartado, precisa de redesenho — ver plano 04 e [[../../game-design/skills-and-study]]).
- **Empregos públicos e hierarquia de cargos** (novo escopo do plano 04, substituindo "Atividade Estudar"): prédio → hierarquia de cargo → habilidade principal/secundária/terciária, eficiência de trabalho baseada nas skills do personagem, e promoção de cargo por eficiência acumulada ao longo do tempo trabalhado — ver [[../../game-design/jobs]] pro desenho completo. Backend concluído (bounded context `employment`); falta a UI.
- **Cliente de API no frontend** pra `POST /characters/:id/activity` (hoje só existe no backend).
- **Polling do estado do personagem**: frontend consulta o backend periodicamente pra refletir o efeito do tick sem precisar recarregar a página (ver [[../../technical/simulation-tick]] — intervalo de polling é uma das decisões pendentes desse documento; fechar aqui).
- Indicador de Fama visível na UI (ver [[../../game-design/progression-fame]]) — mesmo sem nenhuma fonte de fama além de um valor inicial fixo por enquanto. Parcial: Fama já aparece, sem o destaque visual próprio ainda (ver plano 06).

## Fora do escopo

- ~~Cidade, lotes, construção — personagem continua restrito à aba de detalhes~~ — superado: a M03 (Cidade & Lar) já foi implementada fora de ordem, e a decisão [[../../decisions/0025-home-e-a-tela-da-cidade]] fez a Home ser a própria cidade. O que continua fora do escopo *desta* milestone é o que a M03 não cobre: eventos, relacionamentos, empresas.
- Eventos, relacionamentos, empresas, contratos, economia — tudo isso vem depois.
- Múltiplos empregos ou qualquer sistema de emprego privado (só o emprego público genérico existe aqui).
- Balanceamento fino das taxas de efeito — os valores atuais (`RATES_PER_MINUTE`) são placeholder e continuam sendo até M08.

## Estimativa

**1–2 semanas** pros planos 01/03/05/06 (cliente de API, seletor, polling, indicador de fama — trabalho majoritariamente de frontend, seguindo padrões já validados). O plano 04 (empregos públicos e hierarquia de cargos) é bem maior do que a "Atividade Estudar" que ele substitui — catálogo de prédios/cargos, nova entidade de workplace, cálculo de eficiência e lógica de promoção não são um ajuste incremental do motor de simulação existente, são um sistema novo. Recomendo tratar esse plano como um bloco à parte pra estimativa (provavelmente **+1 semana** sobre o resto da milestone) e, se o escopo crescer durante o detalhamento, considerar quebrá-lo em sub-planos (mesmo padrão já usado quando a M03 precisou dos planos 04/06 extras).

## Referências

- [[../../game-design/wryd-activity-system]]
- [[../../game-design/character-needs]]
- [[../../game-design/skills-and-study]]
- [[../../game-design/progression-fame]]
- [[../../game-design/jobs]]
- [[../../technical/simulation-tick]]
- [[../../vision/principles]] (Idle First, Cozy First)
