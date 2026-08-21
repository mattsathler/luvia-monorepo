# Endpoints — World

## Objetivo

Documentar os endpoints do bounded context World (relógio do mundo). Ver [[../../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]] e [[../../relogio-do-mundo]] pro design por trás.

## Base

`/world`

## `GET /world/clock`

**Pública** — não exige `Authorization`. O relógio do mundo é global (uma cidade, um relógio — ver [[../../../decisions/0005-cidade-unica-persistente]]), então não depende de saber quem pergunta.

Retorna a data/hora atual do jogo, calculada como função pura do tempo real decorrido desde a época (epoch) — sem tick nem estado incremental (ver [[../../relogio-do-mundo]]).

**Resposta (200):**

```json
{ "day": 47, "hour": 14.3, "realTimestamp": "2026-08-20T12:00:00.000Z" }
```

- `day`: número do dia de jogo, inteiro, começa em `1`.
- `hour`: hora do dia de jogo, fracionário, `0`–`24` — mesmo formato que `packages/luv-ui/src/city/CycleControl/CycleControl.tsx#DayCycleControl` já espera pra calcular `--sun-x`/`--sun-y`/`--sun-color`.
- `realTimestamp`: ISO 8601, instante real (do servidor) usado pra calcular esta resposta — o frontend usa isso pra extrapolar localmente entre sincronizações (ver [[../../relogio-do-mundo]]).

**Pontos de importância:**

- Qualquer cliente pode chamar, autenticado ou não.
- Chamado periodicamente (polling, a cada 5 minutos reais no frontend) — o resultado muda continuamente (é função do tempo real), então não faz sentido cachear por muito tempo.
- Na primeira chamada de todas, a época (epoch) do relógio é gerada (= o instante dessa primeira chamada) e persistida — chamadas seguintes sempre partem da mesma época (mesmo padrão de `GetOrGenerateCityMapUseCase`, ver [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]).

## Referências

- [[../README]]
- [[../../relogio-do-mundo]]
- [[../../../decisions/0028-relogio-do-mundo-global-sincronizado-do-backend]]
- [[../../../decisions/0005-cidade-unica-persistente]]
- [[../../../decisions/0026-terreno-da-cidade-gerado-e-persistido]]
