# Plano — Desconforto térmico afeta felicidade

## Status

⏳ Pendente

## Objetivo técnico

Primeiro ponto de integração entre os bounded contexts `world` (clima) e `character` (felicidade) — hoje não existe nenhuma dependência entre eles.

## Escopo

- Clima frio (`foggy`) enquanto `character.activity === 'working'` (fora de casa) reduz felicidade ao longo do tempo.
- Clima quente (`sunny`) enquanto `character.activity` é `idle` ou `resting` (em casa) reduz felicidade ao longo do tempo.
- Nenhum efeito nas demais combinações — sem novo estado a manter: o clima do dia já é derivável de `currentWeather(day)` a partir do `day` que o tick/recompute já pode calcular a partir do relógio do mundo.
- Prorata: se o clima muda no meio de um intervalo de recompute (troca de dia de jogo) ou o personagem troca de atividade no meio do intervalo, cada trecho é calculado com o clima/atividade vigentes nele (mesmo padrão já usado por `recomputeUntil` pra trocas de atividade).

## Onde no código

- `apps/api/src/character/domain/entities/activity.ts` (ou onde o novo efeito acabar modelado — hoje é aqui que `RATES_PER_MINUTE` vive)
- `apps/api/src/character/domain/entities/character.entity.ts` (`recomputeUntil`)
- `apps/api/src/world/domain/entities/weather.entity.ts` (`currentWeather`, já existe — só passa a ser consumido por fora de `world`)

## Depende de

Nenhuma — clima (`currentWeather`) e o conceito de "em casa" (via `activity`) já existem, só nunca foram cruzados.

## Referências

- [[../../../decisions/0030-clima-temperatura-e-hora-afetam-felicidade-e-produtividade]]
- [[../../../technical/clima-e-temperatura]]
- [[../../../technical/simulation-tick]]
- [[../../../game-design/character-needs]]
