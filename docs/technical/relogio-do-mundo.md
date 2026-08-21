# Relógio do mundo (data/hora do jogo e iluminação)

## Status

✅ Implementado. Backend: `apps/api/src/world/` (bounded context novo, ver `WorldClock`/`GetWorldClockUseCase`/`WorldController`) + `GET /world/clock`. Frontend: `apps/game/src/pages/home/useWorldClockLighting.ts` (sincronização + extrapolação) + `world-clock-lighting.ts` (fórmula hora→CSS vars, duplicada de `DayCycleControl`), ligado em `HomePage.tsx`. Todos os "Pendente" abaixo foram fechados; ver [[../roadmap/03-cidade-e-lar/planos/08-relogio-do-mundo-e-ciclo-dia-noite]].

## Objetivo

Definir como o backend calcula a data/hora do jogo, como o frontend sincroniza com ela, e como esse valor alimenta a iluminação (ciclo dia/noite) da cidade isométrica.

## Contexto

`packages/luv-ui/src/city/CycleControl/CycleControl.tsx` (`DayCycleControl`) já implementa a fórmula que converte uma hora (`0`–`24`, fracionária) em três CSS custom properties na raiz do documento — `--sun-x`, `--sun-y`, `--sun-color` — consumidas por `packages/luv-ui/src/city/Block/Block.scss` pra sombrear as faces do tile conforme a posição do sol. Hoje esse componente só existe como um slider manual em `apps/docs/src/city/City.tsx` (showcase de design system) — nunca foi ligado a uma fonte de tempo real dentro do jogo (`apps/game`). Este documento fecha esse elo: de onde vem a hora "de verdade".

## Decisões consolidadas

Ver [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]] pras decisões de mais alto nível (relógio único/global, backend autoritativo, ritmo de 96min/dia, polling sem push). Aqui, o mecanismo:

### Fórmula (função pura, sem tick)

```
RATIO = (24h * 60) / 96min = 15   // 15 minutos de jogo por minuto real

minutosDeJogoDecorridos = (agora_real - epoch_real) em minutos * RATIO
diaDeJogo   = floor(minutosDeJogoDecorridos / 1440) + 1
horaDoDia   = (minutosDeJogoDecorridos mod 1440) / 60   // 0–24, fracionário — o que o DayCycleControl espera
```

Não existe job de tick nem estado incremental — qualquer leitura, a qualquer momento, recalcula o valor puro a partir de `epoch_real` (a "época" — o instante real em que o dia 1, 0h00 do jogo começou) e do relógio do servidor. Isso é deliberadamente mais simples que [[simulation-tick]] (que precisa de lotes e `last_updated_at` porque o estado de cada personagem é cumulativo); aqui não há nada pra acumular, só uma conta.

### Persistência do epoch (mesmo padrão de `CITY_SEED`)

`epoch_real` é gerado e persistido na primeira leitura (documento singleton, mesmo padrão de `GetOrGenerateCityMapUseCase`/`city_maps` — ver [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]), não fixo como constante hardcoded eterna. Isso evita que o relógio do mundo "pule" toda vez que o servidor reinicia, e permite que, se o valor precisar mudar (ex.: recalibrar o dia 1 pra uma data específica), isso seja uma migração deliberada — não um efeito colateral de redeploy.

### Endpoint

`GET /world/clock`, no bounded context novo `world` (`apps/api/src/world/`, mesma estrutura DDD de `city`: `domain/entities` → `WorldClock`, `application/use-cases` → `GetOrGenerateWorldClockUseCase`/`GetWorldClockUseCase`, `infrastructure/persistence` → `WorldClockMongoRepository`/`world_clock`, `presentation` → `WorldController`), marcado `@Public()` — sem autenticação necessária, é global e não depende de personagem:

```json
{ "day": 47, "hour": 14.3, "realTimestamp": "2026-08-20T12:00:00.000Z" }
```

- `day`: número do dia de jogo (inteiro, começa em 1).
- `hour`: hora do dia de jogo (`0`–`24`, fracionário) — alimenta `DayCycleControl` direto.
- `realTimestamp`: o instante real (do servidor) em que essa leitura foi calculada — necessário pro frontend saber quanto tempo real já passou desde a sincronização, pra extrapolar localmente (ver abaixo). Sem isso, o frontend teria que confiar no próprio relógio pra saber "quanto tempo passou", o que já é seguro (é só um delta local), mas ter o timestamp do servidor evita qualquer ambiguidade de fuso.

### Sincronização e extrapolação no frontend

`apps/game/src/pages/home/useWorldClockLighting.ts` busca `GET /world/clock` (`apps/game/src/lib/api.ts#getWorldClock`) a cada **5 minutos reais** (`SYNC_INTERVAL_MS`) — suficiente pra corrigir qualquer drift do relógio local sem gerar tráfego à toa. Entre duas sincronizações, em vez de mostrar a hora "parada" até a próxima resposta, um segundo timer (`EXTRAPOLATE_INTERVAL_MS`, a cada 30s reais) reaplica a iluminação extrapolando localmente (`world-clock-lighting.ts#extrapolateHour`):

```
horaAtual = hora_sincronizada + (Date.now() - realTimestamp_sincronizado) em minutos * RATIO / 60
```

Isso mantém a transição de iluminação suave (o sol se move continuamente) sem precisar rebuscar o backend a cada frame — o polling só existe pra recalibrar (corrigir drift do relógio local, ou refletir qualquer ajuste manual do epoch) periodicamente, não pra cada atualização visual. Se a primeira sincronização falhar (ex.: backend fora do ar), a iluminação fica no fallback estático de `Block.scss` até a próxima tentativa — sem crashar.

### Ligação com a iluminação

`apps/game/src/pages/home/world-clock-lighting.ts#applySunLighting` **duplica de propósito** a fórmula de `DayCycleControl` (`--sun-x`/`--sun-y`/`--sun-color` via `document.documentElement.style.setProperty`) em vez de importar/mudar esse componente — mesmo espírito de LOWYS ([[lowys-carregamento-em-chunks]], "packages/luv-ui não mudou"): o design system continua sem saber de conceitos específicos do jogo. `DayCycleControl`/`apps/docs` não mudaram; `apps/game` ganhou sua própria fonte desses valores, chamada de dentro de `HomePage.tsx` via `useWorldClockLighting()`.

## Observações

Resolvido nesta implementação:

- Bounded context: `world`, dedicado (não dentro de `city`).
- Intervalo de polling do frontend: 5 minutos reais (sincronização) + 30s reais (extrapolação/reaplicação visual).
- `DayCycleControl` não muda — `apps/game` duplica a fórmula em `world-clock-lighting.ts`.
- Nesta fase, só `hour` é consumida (iluminação); `day` é retornado pela API mas não aparece em nenhuma UI ainda.

Ainda não definidos (**Pendente** — trade-offs de produto, não de implementação):

- Se/quando `day` (número do dia) deve aparecer em alguma UI (calendário, HUD).
- Onde e se o "instante em que o mundo começou" (o epoch, hoje implicitamente "a primeira vez que alguém chamou `GET /world/clock`") deveria ser uma data com significado de produto (ex.: lançamento do jogo) em vez de um acidente de quando o endpoint foi chamado pela primeira vez em produção.

## Referências

- [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0005-cidade-unica-persistente]]
- [[simulation-tick]]
- [[lowys-carregamento-em-chunks]]
- [[../roadmap/03-cidade-e-lar/planos/08-relogio-do-mundo-e-ciclo-dia-noite]]
- [[../game-design/city-and-world]]
