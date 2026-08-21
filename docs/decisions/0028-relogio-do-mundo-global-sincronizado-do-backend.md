# 0028 — Relógio do mundo é global, autoritativo no backend, e sincronizado por polling

## Contexto

O jogo precisa de uma noção de data e hora **do jogo** (diferente da hora real do dispositivo de cada jogador) — pelo menos pra alimentar o ciclo dia/noite visual (`packages/luv-ui/src/city/CycleControl/CycleControl.tsx#DayCycleControl`, hoje só um slider manual de 0–24h usado como showcase em `apps/docs`, nunca ligado a uma fonte de tempo real dentro do jogo — ver [[../roadmap/03-cidade-e-lar/planos/01-cidade-isometrica-no-jogo]]). Era necessário decidir de onde vem essa hora, se é igual pra todo mundo, e como o frontend fica sabendo dela.

## Decisão

1. **O relógio é único e global** — não existe hora "de cada jogador"; todos veem a mesma data/hora do jogo ao mesmo tempo, do mesmo jeito que existe uma única cidade ([[0005-cidade-unica-persistente]]).
2. **O backend é a única fonte de verdade.** O frontend nunca decide a hora do jogo sozinho a partir do relógio do próprio dispositivo — ele sempre parte de um valor obtido do backend (ver [[../technical/relogio-do-mundo]] pro mecanismo exato).
3. **Ritmo fixo: 1 dia de jogo (24h) = 96 minutos reais** (proporção de 15×: cada minuto real equivale a 15 minutos de jogo).
4. **Sincronização por polling, sem push** — mesma escolha já feita pra character tick ([[0013-sistema-wryd-tick-em-lotes-e-polling]]) e consistente com [[0004-sem-chat-em-tempo-real]]: o frontend pergunta periodicamente ao backend a data/hora atual do jogo, em vez de manter uma conexão aberta (WebSocket/SSE).
5. **Não é um tick simulado com estado incremental.** Diferente da simulação de personagens ([[../technical/simulation-tick]]), o relógio do mundo é uma **função pura do tempo real decorrido** desde uma época de referência (epoch) — não precisa de job em lote nem de recompute por entidade, só uma conta a cada leitura.

## Justificativa

Um relógio por jogador (ou baseado no dispositivo de cada um) quebraria a premissa de mundo único e compartilhado (Social First) — dois jogadores olhando a mesma cidade ao mesmo tempo veriam iluminações diferentes. Calcular a hora como função pura do tempo real (em vez de um tick incremental) evita reaproveitar sem necessidade a complexidade do simulation-tick (lotes, `last_updated_at`, concorrência) pra um valor que não tem estado nenhum pra acumular — é sempre derivável do "agora".

## Consequências

- Nenhuma feature deve assumir fuso-horário ou hora real do jogador — sempre hora **de jogo**, vinda do backend.
- Mudar o ritmo (96min/dia) depois de já ter jogadores exige decidir se a época de referência é recalibrada ou se aceita-se uma descontinuidade visível no relógio — mesma cautela já registrada pra `CITY_SEED` em [[0026-terreno-da-cidade-gerado-e-persistido]].
- `apps/docs`/`DayCycleControl` não precisam saber do backend — o slider manual de showcase continua existindo como está; só `apps/game` passa a alimentar o mesmo componente/mecanismo de iluminação com a hora sincronizada.
- Entre duas sincronizações, o frontend pode extrapolar localmente (usando o próprio relógio do navegador) pra manter a transição de iluminação suave sem precisar rebuscar a cada frame — ver [[../technical/relogio-do-mundo]].

## Referências

- [[../technical/relogio-do-mundo]]
- [[../technical/simulation-tick]]
- [[0004-sem-chat-em-tempo-real]]
- [[0005-cidade-unica-persistente]]
- [[0013-sistema-wryd-tick-em-lotes-e-polling]]
- [[0026-terreno-da-cidade-gerado-e-persistido]]
- [[../roadmap/03-cidade-e-lar/planos/01-cidade-isometrica-no-jogo]]
