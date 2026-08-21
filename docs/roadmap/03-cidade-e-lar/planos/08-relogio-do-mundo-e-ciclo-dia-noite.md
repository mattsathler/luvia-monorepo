# Plano — Relógio do mundo e ciclo dia/noite

## Status

⏳ Pendente — design fechado em [[../../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]] e [[../../../technical/relogio-do-mundo]], nada implementado ainda.

## Objetivo técnico

`IsoGrid`/`Block`/`DayCycleControl` já existem no design system (ver plano 01), mas `DayCycleControl` só é usado como slider manual de showcase em `apps/docs` — nunca foi ligado a uma fonte de tempo real dentro do jogo. Este plano conecta os dois: o backend passa a ditar a data/hora do jogo (ritmo fixo de 96 minutos reais por dia de jogo), o frontend sincroniza periodicamente com ela, e esse valor alimenta a mesma fórmula de iluminação que `DayCycleControl` já implementa.

## Escopo

- Endpoint no backend que devolve a data/hora atual do jogo, calculada como função pura do tempo real decorrido desde uma época persistida (sem tick/job — ver [[../../../technical/relogio-do-mundo]]).
- Sincronização por polling no frontend (`apps/game`), com extrapolação local entre sincronizações pra manter a transição de iluminação suave.
- `apps/game` passa a definir `--sun-x`/`--sun-y`/`--sun-color` a partir da hora sincronizada, em vez de nunca defini-las (hoje cai no fallback estático de `Block.scss`).

## Fora de escopo

- Qualquer UI de calendário/relógio visível pro jogador (HUD mostrando "Dia 47, 14h") — só a iluminação é o consumidor desta primeira fase, a menos que decidido o contrário durante a implementação.
- Mudar `DayCycleControl`/`apps/docs` — o slider manual de showcase continua como está.
- Eventos ou mecânicas de jogo atreladas a hora do dia (ex.: lojas fecharem à noite) — isso é [[../../../game-design/wryd-activity-system]]/outros sistemas, não este plano.

## Onde no código

- Backend: novo endpoint (bounded context a decidir — `city` ou um `world` novo, ver [[../../../technical/relogio-do-mundo]] "Observações").
- Frontend: `apps/game/src/pages/home/` (ou um novo hook/controller dedicado), reaproveitando a fórmula hora→CSS vars de `packages/luv-ui/src/city/CycleControl/CycleControl.tsx#DayCycleControl` sem modificar esse componente (mesmo espírito de LOWYS — `packages/luv-ui` não muda pra acomodar algo específico do jogo).

## Depende de

- Cidade isométrica no jogo (plano 01) — precisa da tela de cidade já renderizando `Block`/`IsoGrid` de verdade pra a iluminação ter algo pra afetar.

## Referências

- [[../../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../../../technical/relogio-do-mundo]]
- [[01-cidade-isometrica-no-jogo]]
- [[../../../technical/simulation-tick]]
