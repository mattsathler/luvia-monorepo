# Relógio do mundo (data/hora do jogo e iluminação)

## Status

⏳ Pendente — design registrado (ver [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]), nada implementado ainda. Ver [[../roadmap/03-cidade-e-lar/planos/08-relogio-do-mundo-e-ciclo-dia-noite]].

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

`GET /world/clock` (ou equivalente, no bounded context `city` ou um novo bounded context `world` — decisão de onde exatamente fica pendente, ver Observações), sem autenticação necessária (é global, não depende de personagem):

```json
{ "day": 47, "hour": 14.3, "realTimestamp": "2026-08-20T12:00:00.000Z" }
```

- `day`: número do dia de jogo (inteiro, começa em 1).
- `hour`: hora do dia de jogo (`0`–`24`, fracionário) — alimenta `DayCycleControl` direto.
- `realTimestamp`: o instante real (do servidor) em que essa leitura foi calculada — necessário pro frontend saber quanto tempo real já passou desde a sincronização, pra extrapolar localmente (ver abaixo). Sem isso, o frontend teria que confiar no próprio relógio pra saber "quanto tempo passou", o que já é seguro (é só um delta local), mas ter o timestamp do servidor evita qualquer ambiguidade de fuso.

### Sincronização e extrapolação no frontend

O frontend busca `GET /world/clock` periodicamente (polling — intervalo exato **Pendente**, mesma natureza do intervalo de polling do simulation-tick). Entre duas sincronizações, em vez de mostrar a hora "parada" até a próxima resposta, extrapola localmente:

```
horaAtual = hora_sincronizada + (Date.now() - realTimestamp_sincronizado) em minutos * RATIO / 60
```

Isso mantém a transição de iluminação suave (o sol se move continuamente) sem precisar rebuscar o backend a cada frame — o polling só existe pra recalibrar (corrigir drift do relógio local, ou refletir qualquer ajuste manual do epoch) periodicamente, não pra cada atualização visual.

### Ligação com a iluminação

O valor de `hora` (sincronizado + extrapolado) é passado pro mesmo mecanismo que `DayCycleControl` já usa (`--sun-x`/`--sun-y`/`--sun-color` via `document.documentElement.style.setProperty`, ver `CycleControl.tsx`) — `apps/game` ganha sua própria fonte desses valores (vindo do relógio sincronizado), reaproveitando a fórmula existente; `apps/docs` continua com o slider manual como está, sem mudança (é só showcase de design system, não precisa saber do backend).

## Observações

Pendente (decisões de implementação, não fechadas ainda):

- Bounded context exato do endpoint: reaproveitar `city` (já é o contexto "global"/singleton, ver [[../decisions/0005-cidade-unica-persistente]]) ou criar um bounded context `world` dedicado.
- Intervalo de polling do frontend.
- Se `DayCycleControl` em si muda de assinatura (ex.: aceitar `hour` como prop controlada em vez de só estado interno via slider) ou se `apps/game` implementa seu próprio hook/componente que replica a mesma fórmula de conversão hora→CSS vars, deixando `DayCycleControl` intocado (mais alinhado à separação já usada em LOWYS, onde `apps/game` duplica fórmulas de `packages/luv-ui` em vez de forçar o design system a conhecer conceitos específicos do jogo — ver [[lowys-carregamento-em-chunks]], seção "packages/luv-ui não mudou").
- Se o `day`/número do dia deve aparecer em alguma UI (calendário, HUD) nesta fase ou só a `hour` (pra iluminação) é consumida por enquanto.

## Referências

- [[../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
- [[../decisions/0005-cidade-unica-persistente]]
- [[simulation-tick]]
- [[lowys-carregamento-em-chunks]]
- [[../roadmap/03-cidade-e-lar/planos/08-relogio-do-mundo-e-ciclo-dia-noite]]
- [[../game-design/city-and-world]]
